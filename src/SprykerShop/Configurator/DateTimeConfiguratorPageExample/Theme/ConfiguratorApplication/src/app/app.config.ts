import { ApplicationConfig } from '@angular/core';
import { HttpClient, provideHttpClient, withXhr } from '@angular/common/http';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { APP_I18N_PREFIX, PROJECT_I18N_PREFIX } from '../services/configurator.service';
import { MergedTranslateLoader } from '../services/merged-translate.loader';

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withXhr()),
        provideTranslateService({
            fallbackLang: 'en_US',
            loader: {
                provide: TranslateLoader,
                useFactory: (http: HttpClient) => new MergedTranslateLoader(http, APP_I18N_PREFIX, PROJECT_I18N_PREFIX),
                deps: [HttpClient],
            },
        }),
    ],
};
