export declare class Base64 {
    private static PADCHAR;
    private static ALPHA;
    private static getByte64;
    static decode(s: string): Uint8Array;
    static encode(s: Uint8Array): string;
}
