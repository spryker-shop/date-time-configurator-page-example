import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MockData, MockDataItem } from '../../services/types';
import { ConfiguratorItemComponent } from '../configurator-item/configurator-item.component';

@Component({
    selector: 'app-configurator-group',
    templateUrl: './configurator-group.component.html',
    styleUrl: './configurator-group.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TranslatePipe, ConfiguratorItemComponent],
})
export class ConfiguratorGroupComponent {
    @Input({ required: true }) currency: string;
    @Input({ required: true }) group: MockData;
    @Input({ required: true }) configuration: Record<string, string>;
    @Output() selectionChange = new EventEmitter<string>();

    isDisabled(item: MockDataItem): string | null {
        if (!item.disabled) {
            return null;
        }

        return (
            Object.entries(item.disabled).find(([key, value]) => value.condition.includes(this.configuration[key]))?.[1]
                ?.tooltip ?? null
        );
    }

    isChecked(item: MockDataItem): boolean {
        return this.configuration[this.group.id] === item.value;
    }

    itemPrice(item: MockDataItem): number {
        return item.price[this.currency] ?? item.price['EUR'] ?? Object.values(item.price)[0] ?? 0;
    }
}
