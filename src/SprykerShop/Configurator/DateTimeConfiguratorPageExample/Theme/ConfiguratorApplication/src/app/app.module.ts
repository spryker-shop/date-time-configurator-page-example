import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { ASSETS } from '../services/configurator.service';
import { ConfigurePricePipe } from '../utils/configure-price.pipe';
import { AppComponent } from './app.component';
import { ConfiguratorGroupComponent } from './configurator-group/configurator-group.component';
import { ConfiguratorItemComponent } from './configurator-item/configurator-item.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { JsonOutputComponent } from './json-output/json-output.component';
import { ProductConfiguratorComponent } from './product-configurator/product-configurator.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { provideTranslateService } from '@ngx-translate/core';

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        FooterComponent,
        ProductDetailsComponent,
        ConfigurePricePipe,
        ProductConfiguratorComponent,
        ConfiguratorGroupComponent,
        ConfiguratorItemComponent,
        JsonOutputComponent,
    ],
    imports: [FormsModule, CommonModule, BrowserModule, TranslateModule],
    providers: [
        provideHttpClient(),
        provideTranslateService({
            loader: provideTranslateHttpLoader({
                prefix: `${ASSETS}/assets/i18n/`,
            }),
        }),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
