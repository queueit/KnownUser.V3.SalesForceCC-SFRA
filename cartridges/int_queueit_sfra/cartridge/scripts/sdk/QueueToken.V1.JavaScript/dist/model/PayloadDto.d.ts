export declare class PayloadDto {
    RelativeQuality?: number;
    Key: string;
    CustomData?: object;
    Serialize(): Uint8Array;
    static DeserializePayload(input: string, secretKey: string, tokenIdentifier: string): PayloadDto;
}
