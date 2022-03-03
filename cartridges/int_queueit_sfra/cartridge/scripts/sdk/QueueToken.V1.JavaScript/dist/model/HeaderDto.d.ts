export declare class HeaderDto {
    TokenVersion: string;
    Encryption: string;
    Issued: number;
    Expires?: number;
    TokenIdentifier: string;
    CustomerId: string;
    EventId: string;
    IpAddress: string;
    XForwardedFor: string;
    static DeserializeHeader(input: string): HeaderDto;
    Serialize(): string;
}
