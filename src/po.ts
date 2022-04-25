declare interface IHeaders {
    'Project-Id-Version': string;
    'Report-Msgid-Bugs-To': string;
    'POT-Creation-Date': string;
    'PO-Revision-Date': string;
    'Last-Translator': string;
    'Language': string;
    'Language-Team': string;
    'Content-Type': string;
    'Content-Transfer-Encoding': string;
    'Plural-Forms': string;
    [name: string]: string;
};

export class Item {
    public msgid: string = '';
    public msgctxt?: string = '';
    public references: string[] = [];
    public msgid_plural?: string = '';
    public msgstr: string[] = [];
    public comments: string[] = [];
    public extractedComments: string[] = [];
    public flags: Record<string, boolean | undefined>;
    public obsolete: boolean;
    //private nplurals: number = 0;
};

export class PO {
    public comments: string[] = [];
    public extractedComments: string[] = [];
    public items: Item[] = [];
    public headers: Partial<IHeaders>;
    headerOrder: any[] = [];
}

export class POLoader {
    constructor() {
    }

    public parse(data: string): PO {
    //support both unix and windows newline formats.
    data = data.replace(/\r\n/g, '\n');
    var po = new PO(); 
    var sections = data.split(/\n\n/);
    var headers: string;
    var theaders: string[] = [];
    //everything until the first 'msgid ""' is considered header
    while (sections[0] && (theaders.length === 0 || theaders[theaders.length - 1].indexOf('msgid ""') < 0)) {
        if (sections[0].match(/msgid\s+"[^"]/)) {
            //found first real string, adding a dummy header item
            theaders.push('msgid ""');
        } else {
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

    headers.split(/\n/).reduce(function (acc: any, line:any) {
        if (acc.merge) {
            //join lines, remove last resp. first "
            line = acc.pop().slice(0, -1) + line.slice(1);
            delete acc.merge;
        }
        if (/^".*"$/.test(line) && !/^".*\\n"$/.test(line)) {
            acc.merge = true;
        }
        acc.push(line);
        return acc;
    }, []).forEach(function (header:string) {
        if (header.match(/^#\./)) {
            po.extractedComments.push(header.replace(/^#\.\s*/, ''));
        } else if (header.match(/^#/)) {
            po.comments.push(header.replace(/^#\s*/, ''));
        } else if (header.match(/^"/)) {
            header = header.trim().replace(/^"/, '').replace(/\\n"$/, '');
            var p = header.split(/:/);
            var name = p.shift().trim();
            var value = p.join(':').trim();
            po.headers[name] = value;
            po.headerOrder.push(name);
        }
    });

    //var parsedPluralForms = PO.parsePluralForms(po.headers['Plural-Forms']);
   // var nplurals = parsedPluralForms.nplurals;
   // var item = new Item({ nplurals: nplurals });
    var item = new Item();
    var context = null;
    var plural = 0;
    var obsoleteCount = 0;
    var noCommentLineCount = 0;

    function trim(string: string) {
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
            //item = new Item({ nplurals: nplurals });
            item = new Item();
        }
    }

    function extract(string: string) {
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
        //var add = false;

        if (line.match(/^#\~/)) { // Obsolete item
            //only remove the obsolte comment mark, here
            //might be, this is a new item, so
            //only remember, this line is marked obsolete, count after line is parsed
            line = trim(line.substring(2));
            lineObsolete = true;
        }

        if (line.match(/^#:/)) { // Reference
            finish();
            item.references.push(trim(line.replace(/^#:/, '')));
        } else if (line.match(/^#,/)) { // Flags
            finish();
            var flags = trim(line.replace(/^#,/, '')).split(',');
            for (var i = 0; i < flags.length; i++) {
                item.flags[flags[i]] = true;
            }
        } else if (line.match(/^#($|\s+)/)) { // Translator comment
            finish();
            item.comments.push(trim(line.replace(/^#($|\s+)/, '')));
        } else if (line.match(/^#\./)) { // Extracted comment
            finish();
            item.extractedComments.push(trim(line.replace(/^#\./, '')));
        } else if (line.match(/^msgid_plural/)) { // Plural form
            item.msgid_plural = extract(line);
            context = 'msgid_plural';
            noCommentLineCount++;
        } else if (line.match(/^msgid/)) { // Original
            finish();
            item.msgid = extract(line);
            context = 'msgid';
            noCommentLineCount++;
        } else if (line.match(/^msgstr/)) { // Translation
            var m = line.match(/^msgstr\[(\d+)\]/);
            plural = m && m[1] ? parseInt(m[1]) : 0;
            item.msgstr[plural] = extract(line);
            context = 'msgstr';
            noCommentLineCount++;
        } else if (line.match(/^msgctxt/)) { // Context
            finish();
            item.msgctxt = extract(line);
            context = 'msgctxt';
            noCommentLineCount++;
        } else { // Probably multiline string or blank
            if (line.length > 0) {
                noCommentLineCount++;
                if (context === 'msgstr') {
                    item.msgstr[plural] += extract(line);
                } else if (context === 'msgid') {
                    item.msgid += extract(line);
                } else if (context === 'msgid_plural') {
                    item.msgid_plural += extract(line);
                } else if (context === 'msgctxt') {
                    item.msgctxt += extract(line);
                }
            }
        }

        if (lineObsolete) {
            // Count obsolete lines for this item
            obsoleteCount++;
        }
    }
    finish();

    return po;
    };
};
/*
parsePluralForms(pluralFormsString: string) {
    var results = (pluralFormsString || '')
        .split(';')
        .reduce(function (acc, keyValueString) {
            var trimmedString = keyValueString.trim();
            var equalsIndex = trimmedString.indexOf('=');
            var key = trimmedString.substring(0, equalsIndex).trim();
            var value = trimmedString.substring(equalsIndex + 1).trim();
            acc[key] = value;
            return acc;
        }, {});
    return {
        nplurals: results.nplurals,
        plural: results.plural
    };
};
*/

/*
class Item {
public Item(options: any) {
    var nplurals = options && options.nplurals;

    this.msgid = '';
    this.msgctxt = null;
    this.references = [];
    this.msgid_plural = null;
    this.msgstr = [];
    this.comments = []; // translator comments
    this.extractedComments = [];
    this.flags = {};
    this.obsolete = false;
    var npluralsNumber = Number(nplurals);
    this.nplurals = (isNaN(npluralsNumber)) ? 2 : npluralsNumber;
};
*/