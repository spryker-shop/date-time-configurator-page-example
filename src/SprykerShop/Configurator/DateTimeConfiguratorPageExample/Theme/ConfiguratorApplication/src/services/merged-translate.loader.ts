import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslationObject, mergeDeep } from '@ngx-translate/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

/**
 * Loads glossary keys from two sources and deep-merges them:
 *  1. The application's built-in glossary shipped inside the bundle (`assets/i18n`).
 *  2. An optional project glossary located next to `configurator.json` (`i18n`).
 *
 * Keys from the project glossary take precedence, allowing projects to override or
 * extend translations without rebuilding the application.
 */
export class MergedTranslateLoader implements TranslateLoader {
    constructor(
        private http: HttpClient,
        private appPrefix: string,
        private projectPrefix: string,
        private suffix: string = '.json',
    ) {}

    getTranslation(lang: string): Observable<TranslationObject> {
        const appTranslation$ = this.loadSource(`${this.appPrefix}${lang}${this.suffix}`, true);
        const projectTranslation$ = this.loadSource(`${this.projectPrefix}${lang}${this.suffix}`, false);

        return forkJoin([appTranslation$, projectTranslation$]).pipe(
            map(([appTranslation, projectTranslation]) => mergeDeep(appTranslation, projectTranslation)),
        );
    }

    /**
     * Fetches a single glossary file. The application glossary is required, while the
     * project glossary is optional and resolves to an empty object when it is absent.
     *
     * A missing optional file may surface either as an HTTP error (404) or, on servers
     * that fall back to an index page, as a 200 with a non-object body. Both cases are
     * treated as "no glossary" so the merge never breaks.
     */
    private loadSource(url: string, required: boolean): Observable<TranslationObject> {
        return this.http.get<TranslationObject>(url).pipe(
            // Optional sources may resolve to a 200 with a non-object body (e.g. an index
            // fallback) when the file is absent; coerce that to an empty glossary.
            map((translation) => (required || this.isTranslationObject(translation) ? translation : {})),
            catchError((error) => {
                if (required) {
                    throw error;
                }

                return of({});
            }),
        );
    }

    private isTranslationObject(value: unknown): value is TranslationObject {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
}
