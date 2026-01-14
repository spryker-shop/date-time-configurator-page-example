import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    standalone: false,
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}
