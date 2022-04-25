import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
export declare class TranslatePoHttpLoader implements TranslateLoader {
    protected _http: HttpClient;
    protected _prefix: string;
    protected _suffix: string;
    constructor(_http: HttpClient, _prefix?: string, _suffix?: string);
    getTranslation(lang: string): Observable<any>;
    parse(contents: string): any;
}
