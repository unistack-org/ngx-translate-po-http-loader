"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POLoader = exports.PO = exports.Item = void 0;
;
var Item = (function () {
    function Item() {
        this.msgid = '';
        this.msgctxt = '';
        this.references = [];
        this.msgid_plural = '';
        this.msgstr = [];
        this.comments = [];
        this.extractedComments = [];
    }
    return Item;
}());
exports.Item = Item;
;
var PO = (function () {
    function PO() {
        this.comments = [];
        this.extractedComments = [];
        this.items = [];
        this.headerOrder = [];
    }
    return PO;
}());
exports.PO = PO;
var POLoader = (function () {
    function POLoader() {
    }
    POLoader.prototype.parse = function (data) {
        data = data.replace(/\r\n/g, '\n');
        var po = new PO();
        var sections = data.split(/\n\n/);
        var headers;
        var theaders = [];
        while (sections[0] && (theaders.length === 0 || theaders[theaders.length - 1].indexOf('msgid ""') < 0)) {
            if (sections[0].match(/msgid\s+"[^"]/)) {
                theaders.push('msgid ""');
            }
            else {
                theaders.push(sections.shift());
            }
        }
        headers = theaders.join('\n');
        var lines = sections.join('\n').split(/\n/);
        po.headers = {
            'Project-Id-Version': '',
            'Report-Msgid-Bugs-To': '',
            'POT-Creation-Date': '',
            'PO-Revision-Date': '',
            'Last-Translator': '',
            'Language': '',
            'Language-Team': '',
            'Content-Type': '',
            'Content-Transfer-Encoding': '',
            'Plural-Forms': '',
        };
        po.headerOrder = [];
        headers.split(/\n/).reduce(function (acc, line) {
            if (acc.merge) {
                line = acc.pop().slice(0, -1) + line.slice(1);
                delete acc.merge;
            }
            if (/^".*"$/.test(line) && !/^".*\\n"$/.test(line)) {
                acc.merge = true;
            }
            acc.push(line);
            return acc;
        }, []).forEach(function (header) {
            if (header.match(/^#\./)) {
                po.extractedComments.push(header.replace(/^#\.\s*/, ''));
            }
            else if (header.match(/^#/)) {
                po.comments.push(header.replace(/^#\s*/, ''));
            }
            else if (header.match(/^"/)) {
                header = header.trim().replace(/^"/, '').replace(/\\n"$/, '');
                var p = header.split(/:/);
                var name = p.shift().trim();
                var value = p.join(':').trim();
                po.headers[name] = value;
                po.headerOrder.push(name);
            }
        });
        var item = new Item();
        var context = null;
        var plural = 0;
        var obsoleteCount = 0;
        var noCommentLineCount = 0;
        function trim(string) {
            return string.replace(/^\s+|\s+$/g, '');
        }
        function finish() {
            if (item.msgid.length > 0) {
                if (obsoleteCount >= noCommentLineCount) {
                    item.obsolete = true;
                }
                obsoleteCount = 0;
                noCommentLineCount = 0;
                po.items.push(item);
                item = new Item();
            }
        }
        function extract(string) {
            string = trim(string);
            string = string.replace(/^[^"]*"|"$/g, '');
            string = string.replace(/\\([abtnvfr'"\\?]|([0-7]{3})|x([0-9a-fA-F]{2}))/g, function (match, esc, oct, hex) {
                if (oct) {
                    return String.fromCharCode(parseInt(oct, 8));
                }
                if (hex) {
                    return String.fromCharCode(parseInt(hex, 16));
                }
                switch (esc) {
                    case 'a':
                        return '\x07';
                    case 'b':
                        return '\b';
                    case 't':
                        return '\t';
                    case 'n':
                        return '\n';
                    case 'v':
                        return '\v';
                    case 'f':
                        return '\f';
                    case 'r':
                        return '\r';
                    default:
                        return esc;
                }
            });
            return string;
        }
        while (lines.length > 0) {
            var line = trim(lines.shift());
            var lineObsolete = false;
            if (line.match(/^#\~/)) {
                line = trim(line.substring(2));
                lineObsolete = true;
            }
            if (line.match(/^#:/)) {
                finish();
                item.references.push(trim(line.replace(/^#:/, '')));
            }
            else if (line.match(/^#,/)) {
                finish();
                var flags = trim(line.replace(/^#,/, '')).split(',');
                for (var i = 0; i < flags.length; i++) {
                    item.flags[flags[i]] = true;
                }
            }
            else if (line.match(/^#($|\s+)/)) {
                finish();
                item.comments.push(trim(line.replace(/^#($|\s+)/, '')));
            }
            else if (line.match(/^#\./)) {
                finish();
                item.extractedComments.push(trim(line.replace(/^#\./, '')));
            }
            else if (line.match(/^msgid_plural/)) {
                item.msgid_plural = extract(line);
                context = 'msgid_plural';
                noCommentLineCount++;
            }
            else if (line.match(/^msgid/)) {
                finish();
                item.msgid = extract(line);
                context = 'msgid';
                noCommentLineCount++;
            }
            else if (line.match(/^msgstr/)) {
                var m = line.match(/^msgstr\[(\d+)\]/);
                plural = m && m[1] ? parseInt(m[1]) : 0;
                item.msgstr[plural] = extract(line);
                context = 'msgstr';
                noCommentLineCount++;
            }
            else if (line.match(/^msgctxt/)) {
                finish();
                item.msgctxt = extract(line);
                context = 'msgctxt';
                noCommentLineCount++;
            }
            else {
                if (line.length > 0) {
                    noCommentLineCount++;
                    if (context === 'msgstr') {
                        item.msgstr[plural] += extract(line);
                    }
                    else if (context === 'msgid') {
                        item.msgid += extract(line);
                    }
                    else if (context === 'msgid_plural') {
                        item.msgid_plural += extract(line);
                    }
                    else if (context === 'msgctxt') {
                        item.msgctxt += extract(line);
                    }
                }
            }
            if (lineObsolete) {
                obsoleteCount++;
            }
        }
        finish();
        return po;
    };
    ;
    return POLoader;
}());
exports.POLoader = POLoader;
;
//# sourceMappingURL=po.js.map