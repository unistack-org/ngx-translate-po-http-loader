"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslatePoHttpLoader = void 0;
var operators_1 = require("rxjs/operators");
var po_1 = require("./po");
var TranslatePoHttpLoader = (function () {
    function TranslatePoHttpLoader(_http, _prefix, _suffix) {
        if (_prefix === void 0) { _prefix = 'i18n'; }
        if (_suffix === void 0) { _suffix = '.po'; }
        this._http = _http;
        this._prefix = _prefix;
        this._suffix = _suffix;
    }
    TranslatePoHttpLoader.prototype.getTranslation = function (lang) {
        var _this = this;
        return this._http
            .get("".concat(this._prefix, "/").concat(lang).concat(this._suffix), { responseType: 'text' })
            .pipe((0, operators_1.map)(function (contents) { return _this.parse(contents); }));
    };
    TranslatePoHttpLoader.prototype.parse = function (contents) {
        var translations = {};
        var doc = new po_1.POLoader();
        var po = doc.parse(contents);
        po.items.forEach(function (item) {
            if (item.msgid.length > 0 && item.msgstr.length > 0) {
                translations[item.msgid] = item.msgstr.join('\n');
            }
        });
        return translations;
    };
    return TranslatePoHttpLoader;
}());
exports.TranslatePoHttpLoader = TranslatePoHttpLoader;
//# sourceMappingURL=index.js.map