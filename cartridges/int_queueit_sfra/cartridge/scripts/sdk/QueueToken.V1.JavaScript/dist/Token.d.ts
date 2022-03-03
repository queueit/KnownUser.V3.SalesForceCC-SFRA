import { TokenVersion } from "./model/TokenVersion";
import { IEnqueueTokenPayload } from "./Payload";
import { EncryptionType } from "./model/EncryptionType";
export declare class Token {
    static Enqueue(customerId: string, tokenIdentifierPrefix?: string): EnqueueTokenGenerator;
    static Parse(token: string, secretKey: string): IEnqueueToken;
}
export declare class EnqueueTokenGenerator {
    private _token;
    constructor(customerId: string, tokenIdentifier?: string);
    WithEventId(eventId: string): EnqueueTokenGenerator;
    WithValidity(validityMillis: number): EnqueueTokenGenerator;
    WithValidityDate(validity: Date): EnqueueTokenGenerator;
    WithPayload(payload: IEnqueueTokenPayload): EnqueueTokenGenerator;
    WithIpAddress(ip: string, xForwardedFor: string): EnqueueTokenGenerator;
    Generate(secretKey: string): IEnqueueToken;
}
export declare class EnqueueToken {
    private readonly _tokenIdentifierPrefix;
    CustomerId: string;
    EventId: string;
    IpAddress: string;
    XForwardedFor: string;
    Issued: Date;
    readonly TokenVersion: TokenVersion;
    readonly Encryption: EncryptionType;
    Expires: Date;
    private _tokenIdentifier;
    private _payload;
    private _tokenWithoutHash;
    private _hashCode;
    get Payload(): IEnqueueTokenPayload;
    private set Payload(value);
    get Token(): string;
    get HashCode(): string;
    private set HashCode(value);
    get TokenWithoutHash(): string;
    private set TokenWithoutHash(value);
    get TokenIdentifier(): string;
    private set TokenIdentifier(value);
    constructor(customerId: string, tokenIdentifierPrefix: string);
    static Create(tokenIdentifier: string, customerId: string, eventId: string, issued: Date, expires: Date, ipAddress: string, xForwardedFor: string, payload: IEnqueueTokenPayload): EnqueueToken;
    private static GetTokenIdentifier;
    Generate(secretKey: string, resetTokenIdentifier?: boolean): void;
    static Parse(tokenString: string, secretKey: string): IEnqueueToken;
    static AddIPAddress(token: EnqueueToken, ipAddress: string, xForwardedFor: string): EnqueueToken;
    static AddEventId(token: EnqueueToken, eventId: string): EnqueueToken;
    static AddExpires(token: EnqueueToken, expires: number): EnqueueToken;
    static AddExpiresWithDate(token: EnqueueToken, expires: Date): EnqueueToken;
    static AddPayload(token: EnqueueToken, payload: IEnqueueTokenPayload): EnqueueToken;
}
export declare class TokenDeserializationException extends Error {
    readonly InternalException: Error;
    constructor(message: string, ex: Error);
}
export declare class InvalidHashException extends TokenDeserializationException {
    constructor();
}
export declare class TokenSerializationException extends Error {
    readonly InternalException: Error;
    constructor(ex: Error);
}
export declare class ArgumentException extends Error {
    constructor(message: string);
}
export interface IEnqueueToken {
    readonly TokenVersion: TokenVersion;
    readonly Encryption: EncryptionType;
    readonly Issued: Date;
    readonly Expires: Date;
    readonly TokenIdentifier: string;
    readonly CustomerId: string;
    readonly EventId: string;
    readonly IpAddress: string;
    readonly XForwardedFor: string;
    readonly Payload: IEnqueueTokenPayload;
    readonly TokenWithoutHash: string;
    readonly Token: string;
    readonly HashCode: string;
}
