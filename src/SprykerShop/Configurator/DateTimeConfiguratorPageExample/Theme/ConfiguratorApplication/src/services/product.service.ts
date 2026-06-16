import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { ProductData, ProductMetaData } from './types';

@Injectable({ providedIn: 'root' })
export class ProductService {
    constructor(
        private http: HttpClient,
        private translate: TranslateService,
    ) {}

    private token = this.getToken();

    private data$ = this.http
        .get<{ data: ProductData }>('/', {
            params: { getConfigurationByToken: this.token },
        })
        .pipe(
            !environment.production
                ? catchError(() => this.http.get<{ data: ProductData }>('/assets/mock.json'))
                : tap(),
            switchMap((response) => {
                if (!response) {
                    return EMPTY;
                }

                // Server data may omit the locale; fall back to the configured fallback
                // language so the loader never requests an "undefined.json" glossary.
                const locale = response.data.locale_name || this.translate.getFallbackLang();

                if (!locale) {
                    return of(response.data);
                }

                return this.translate.use(locale).pipe(map(() => response.data));
            }),
            shareReplay({ bufferSize: 1, refCount: true }),
        );

    getData(): Observable<ProductData> {
        return this.data$;
    }

    getMetaData(data: FormData): Observable<ProductMetaData> {
        return this.http.post<ProductMetaData>('/', data, {
            params: { prepareConfiguration: this.token },
        });
    }

    private getToken(): string {
        return new URLSearchParams(location.search).get('getConfigurationByToken') ?? '';
    }
}
