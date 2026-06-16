import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfigurePricePipe } from '../../utils/configure-price.pipe';

@Component({
    selector: 'app-configurator-item',
    templateUrl: './configurator-item.component.html',
    styleUrl: './configurator-item.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CurrencyPipe, TranslatePipe, ConfigurePricePipe],
})
export class ConfiguratorItemComponent {
    @Input() value: string;
    @Input() price: number;
    @Input() currency: string;
    @Input() checked = false;
    @Input() disabled?: string | null;
    @Output() selectionChange = new EventEmitter<string>();

    withTooltip(): boolean {
        return typeof this.disabled === 'string';
    }

    onClick(): void {
        if (this.disabled || this.checked) {
            return;
        }

        this.selectionChange.emit(this.value);
    }
}
