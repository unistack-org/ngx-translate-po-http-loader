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
}
export declare class Item {
    msgid: string;
    msgctxt?: string;
    references: string[];
    msgid_plural?: string;
    msgstr: string[];
    comments: string[];
    extractedComments: string[];
    flags: Record<string, boolean | undefined>;
    obsolete: boolean;
}
export declare class PO {
    comments: string[];
    extractedComments: string[];
    items: Item[];
    headers: Partial<IHeaders>;
    headerOrder: any[];
}
export declare class POLoader {
    constructor();
    parse(data: string): PO;
}
export {};
