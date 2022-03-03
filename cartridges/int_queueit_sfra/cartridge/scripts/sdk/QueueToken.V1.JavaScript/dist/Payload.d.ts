export declare class Payload {
    static Enqueue(): EnqueueTokenPayloadGenerator;
}
export declare class EnqueueTokenPayloadGenerator {
    private _payload;
    constructor();
    WithKey(key: string): EnqueueTokenPayloadGenerator;
    WithRelativeQuality(relativeQuality: number): EnqueueTokenPayloadGenerator;
    WithCustomData(key: string, value: string): EnqueueTokenPayloadGenerator;
    Generate(): IEnqueueTokenPayload;
}
export interface IEnqueueTokenPayload {
    readonly Key: string;
    readonly RelativeQuality?: number;
    readonly CustomData: Object;
    EncryptAndEncode(secretKey: string, tokenIdentifier: string): string;
    Serialize(): Uint8Array;
}
export declare class EnqueueTokenPayload implements IEnqueueTokenPayload {
    private _customData;
    private _key;
    private _relativeQuality;
    get Key(): string;
    private set Key(value);
    get CustomData(): Object;
    get RelativeQuality(): number;
    private set RelativeQuality(value);
    constructor();
    static create(payload?: EnqueueTokenPayload, key?: string, relativeQuality?: number, customData?: object): EnqueueTokenPayload;
    AddCustomData(key: string, value: string): EnqueueTokenPayload;
    Serialize(): Uint8Array;
    static Deserialize(input: string, secretKey: string, tokenIdentifier: string): EnqueueTokenPayload;
    EncryptAndEncode(secretKey: string, tokenIdentifier: string): string;
}
