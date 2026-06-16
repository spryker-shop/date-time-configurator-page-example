import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfiguratorService } from '../../services/configurator.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [AsyncPipe, TranslatePipe],
})
export class HeaderComponent {
    constructor(protected configuration: ConfiguratorService) {}

    title$ = this.configuration.productData$.pipe(map((data) => data.name));
    logo$ = this.configuration.productData$.pipe(map((data) => data.logo));
    info$ = this.configuration.productData$.pipe(
        map((data) => [
            {
                title: 'global.store',
                value: data.store_name,
            },
            {
                title: 'global.locale',
                value: data.locale_name,
            },
            {
                title: 'global.priceMode',
                value: data.price_mode,
            },
            {
                title: 'global.currency',
                value: data.currency_code,
            },
            {
                title: 'global.customerId',
                value: data.customer_reference,
            },
        ]),
    );
    modalTrigger$ = new Subject<boolean>();
    modal$ = this.modalTrigger$.pipe(
        withLatestFrom(this.configuration.dirty$),
        tap(([status, dirty]) => {
            if (!dirty && status) {
                this.backTrigger();

                return;
            }

            this.setScrollLock(status);
        }),
        map(([status, dirty]) => dirty && status),
    );

    modalTrigger(event: Event, value: boolean): void {
        event.preventDefault();
        this.modalTrigger$.next(value);
    }

    backTrigger(): void {
        history.back();
    }

    private setScrollLock(locked: boolean): void {
        document.documentElement.style.height = locked ? '100%' : '';
        document.documentElement.style.overflow = locked ? 'hidden' : '';
    }
}
