import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { POLoader, Item } from './po';

export class TranslatePoHttpLoader implements TranslateLoader {

	/**
	 * Translation domain
	 */
	//public domain = '';

	constructor(
		protected _http: HttpClient,
		protected _prefix: string = 'i18n',
		protected _suffix: string = '.po'
	) {
	}

	/**
	 * Gets the translations from file
	 * @param lang
	 * @returns {any}
	 */
	public getTranslation(lang: string): Observable<any> {
		return this._http
			.get(`${this._prefix}/${lang}${this._suffix}`, { responseType: 'text' })
			.pipe(map((contents: string) => this.parse(contents)));
	}

	/**
	 * Parse po file
	 * @param contents
	 * @returns {any}
	 */
	public parse(contents: string): any {
		let translations: { [key: string]: string } = {};

		let doc = new POLoader();
		let po = doc.parse(contents);
	
		po.items.forEach((item: Item) => {
				if (item.msgid.length > 0 && item.msgstr.length > 0) {
					translations[item.msgid] = item.msgstr.join('\n');
				}
			});

		return translations;
	}

}

