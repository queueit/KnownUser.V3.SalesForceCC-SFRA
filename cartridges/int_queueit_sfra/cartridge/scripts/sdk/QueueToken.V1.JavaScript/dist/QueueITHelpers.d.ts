export declare class Utils {
    static maxDate(): Date;
    static utcNow(): number;
    static padRight(str: string, padding: string, stringSize: number): string;
    static generateUUID(): string;
    static generateKey(value: string): Uint8Array;
    static generateIV(value: string): Uint8Array;
    static uint8ArrayToHexString(byteArray: Uint8Array): string;
    static uint8ArrayToString(array: Uint8Array): string;
    static stringToUint8Array(value: string): Uint8Array;
}
export declare class ShaHashing {
    static GenerateHash(secretKey: string, tokenString: string): Uint8Array;
}
export declare class AESEncryption {
    static EncryptPayload(secretKey: string, tokenIdentifier: string, valueToEncrypt: string): string;
    static DecryptPayload(secretKey: string, tokenIdentifier: string, valueToDecrypt: Uint8Array): Uint8Array;
}
