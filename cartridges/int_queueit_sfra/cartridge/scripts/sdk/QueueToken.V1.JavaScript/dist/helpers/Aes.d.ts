export declare class Utf8Converter {
    static toBytes(text: string): Uint8Array;
    static fromBytes(bytes: Uint8Array): string;
}
export declare class Aes {
    private readonly key;
    private _Ke;
    private _Kd;
    constructor(key: any);
    private prepare;
    encrypt(plaintext: Uint8Array): Uint8Array;
    decrypt(ciphertext: Uint8Array): Uint8Array;
}
/**
 *  Mode Of Operation - Cipher Block Chaining (CBC)
 */
export declare class ModeOfOperationCBC {
    private description;
    private name;
    private _lastCipherblock;
    private _aes;
    constructor(key: Uint8Array, iv: Uint8Array);
    encrypt(plaintext: any): Uint8Array;
    decrypt(ciphertext: Uint8Array): Uint8Array;
}
export declare function pkcs7pad(data: any): Uint8Array;
export declare function pkcs7strip(data: Uint8Array): Uint8Array;
