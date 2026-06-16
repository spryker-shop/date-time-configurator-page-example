import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    Observable,
    combineLatest,
    map,
    merge,
    of,
    scan,
    shareReplay,
    startWith,
    switchMap,
    withLatestFrom,
} from 'rxjs';
import { environment } from '../environments/environment';
import { ProductService } from './product.service';
import {
    ConfiguredProduct,
    CurrencyPrices,
    MockConfigurator,
    MockDataItem,
    MockVolumePricesConfig,
    ServerData,
} from './types';

const FALLBACK_CURRENCY = 'EUR';

export const ASSETS = !environment.production ? '' : './dist';
const CONFIGURATOR = !environment.production ? `${ASSETS}/assets/data/configurator.json` : './configurator.json';

// Glossary shipped inside the application bundle.
export const APP_I18N_PREFIX = `${ASSETS}/assets/i18n/`;

// Optional project glossary located next to configurator.json. Keys defined here
// override the bundled glossary, letting projects extend translations without a rebuild.
export const PROJECT_I18N_PREFIX = !environment.production ? `${ASSETS}/assets/data/i18n/` : './i18n/';

@Injectable({ providedIn: 'root' })
export class ConfiguratorService {
    constructor(
        private http: HttpClient,
        private product: ProductService,
    ) {}

    readonly configuration$ = this.http
        .get<MockConfigurator>(CONFIGURATOR)
        .pipe(shareReplay({ bufferSize: 1, refCount: true }));

    readonly data$ = this.configuration$.pipe(
        map((data) => data.configuration),
        shareReplay({ bufferSize: 1, refCount: true }),
    );
    readonly defaults$ = this.configuration$.pipe(map((data) => data.defaults));
    readonly productData$ = this.configuration$.pipe(
        withLatestFrom(this.product.getData()),
        map(([data, product]) => ({
            ...data.data,
            ...product,
        })),
        shareReplay({ bufferSize: 1, refCount: true }),
    );

    private setConfigurator$ = new BehaviorSubject<Partial<ConfiguredProduct>>({});

    readonly configurator$: Observable<ConfiguredProduct & { price: number }> = this.product.getData().pipe(
        switchMap((data: ServerData) => {
            const configuredData = this.generateConfiguredData(data);
            return this.setConfigurator$.pipe(
                startWith(configuredData),
                scan((config, newConfig) => ({
                    ...config,
                    ...newConfig,
                    configuration: {
                        ...config.configuration,
                        ...newConfig.configuration,
                    },
                })),
                switchMap((configurator) => combineLatest([of(configurator), this.configuration$])),
                map(([configurator, config]) => {
                    const {
                        defaults,
                        configuration: configurationData,
                        data: { defaultPrice },
                        volumePrices,
                    } = config;

                    const currency = configurator.currency_code;

                    configurator.configuration = {
                        ...defaults,
                        ...(configurator.configuration as Record<string, string>),
                    };
                    configurator.display_data = {};
                    configurator.available_quantity = null;

                    this.assignVolumePrices(configurator, volumePrices);

                    configurator.price = Object.entries(configurator.configuration).reduce(
                        (price, [key, value]) => {
                            const entry = configurationData.find((configs) => configs.id === key);
                            const active = entry?.data?.find((options) => options.value === value);
                            const uncheck = active?.disabled
                                ? Object.entries(active.disabled).some(([disabledKey, disabledValue]) =>
                                      (disabledValue.condition as string[]).includes(
                                          configurator.configuration[disabledKey],
                                      ),
                                  )
                                : null;
                            this.assignAvailability(active, configurator);

                            if (uncheck) {
                                delete configurator.configuration[key];
                                delete configurator.display_data[entry.label];
                            }

                            if (active && !uncheck) {
                                configurator.display_data[entry.label] = active.title;
                            }

                            return active && !uncheck ? this.resolvePrice(active.price, currency) + price : price;
                        },
                        this.resolvePrice(defaultPrice, currency),
                    );

                    return { ...configurator } as ConfiguredProduct & { price: number };
                }),
            );
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
    );
    readonly loading$ = merge(
        this.product.getData().pipe(map(() => true)),
        this.configurator$.pipe(map(() => false)),
    ).pipe(startWith(true));
    readonly dirty$ = combineLatest([this.configurator$, this.defaults$]).pipe(
        map(([data, defaults]) => JSON.stringify(data.configuration) !== JSON.stringify(defaults)),
    );

    private generateConfiguredData(response: ServerData): ConfiguredProduct {
        return {
            ...response,
            configuration: this.parseJsonObject(response.configuration),
            display_data: this.parseJsonObject(response.display_data),
            price: 0,
            available_quantity: null,
        };
    }

    /**
     * Server data delivers `configuration` and `display_data` as JSON strings, but either
     * may be absent or empty. Resolves any non-parseable input to an empty object so the
     * configurator can still render.
     */
    private parseJsonObject(value: string | undefined | null): Record<string, string> {
        if (!value) {
            return {};
        }

        try {
            return JSON.parse(value);
        } catch {
            return {};
        }
    }

    updateConfiguratorConfiguration(data: Record<string, string>): void {
        this.setConfigurator$.next({
            configuration: data,
        });
    }

    updateWithGeneratedProductData(newProductData: Partial<ConfiguredProduct>): void {
        this.setConfigurator$.next(newProductData);
    }

    /**
     * Resolves a per-currency price map to a single amount for the active currency.
     * Falls back to EUR, then to the first available currency, then to 0.
     */
    private resolvePrice(prices: CurrencyPrices | undefined, currency: string): number {
        if (!prices) {
            return 0;
        }

        return prices[currency] ?? prices[FALLBACK_CURRENCY] ?? Object.values(prices)[0] ?? 0;
    }

    private assignAvailability(item: MockDataItem | undefined, configurator: Partial<ConfiguredProduct>): void {
        if (item?.availableQuantity === undefined) {
            return;
        }

        const availableQuantity =
            typeof item.availableQuantity === 'number'
                ? item.availableQuantity
                : item.availableQuantity.find((condition) =>
                      Object.entries(condition.condition).every(([key, value]) => configurator[key] === value),
                  )?.quantity;

        if (configurator.available_quantity === null || availableQuantity < configurator.available_quantity) {
            configurator.available_quantity = availableQuantity;
        }
    }

    private assignVolumePrices(
        configurator: Partial<ConfiguredProduct>,
        volumePrices?: MockVolumePricesConfig[],
    ): void {
        if (!volumePrices) {
            configurator.volume_prices = null;

            return;
        }

        for (const volumePrice of volumePrices) {
            if (this.areObjectsEqual(volumePrice.condition, configurator.configuration)) {
                configurator.volume_prices = {
                    volume_prices: volumePrice.prices[configurator.price_mode],
                };

                return;
            }
        }

        configurator.volume_prices = null;
    }

    private areObjectsEqual(obj1: Record<string, string>, obj2: Record<string, string>): boolean {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        return keys1.every((key) => obj1[key] === obj2[key]);
    }
}
