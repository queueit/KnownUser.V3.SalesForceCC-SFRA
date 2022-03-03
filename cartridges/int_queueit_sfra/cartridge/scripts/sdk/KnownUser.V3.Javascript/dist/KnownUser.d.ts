import { UserInQueueService } from './UserInQueueService';
import { IConnectorContextProvider } from './ConnectorContextProvider';
import { CancelEventConfig, QueueEventConfig, RequestValidationResult } from './Models';
export declare class KnownUser {
    static readonly QueueITTokenKey = "queueittoken";
    static readonly QueueITDebugKey = "queueitdebug";
    static readonly QueueITAjaxHeaderKey = "x-queueit-ajaxpageurl";
    static UserInQueueService: UserInQueueService;
    private static getUserInQueueService;
    private static isQueueAjaxCall;
    private static generateTargetUrl;
    private static logExtraRequestDetails;
    private static setDebugCookie;
    private static _resolveQueueRequestByLocalConfig;
    private static _cancelRequestByLocalConfig;
    private static handleQueueAction;
    private static handleCancelAction;
    private static handleIgnoreAction;
    static extendQueueCookie(eventId: string, cookieValidityMinute: number, cookieDomain: string, isCookieHttpOnly: boolean, isCookieSecure: boolean, secretKey: string, contextProvider: IConnectorContextProvider): void;
    static resolveQueueRequestByLocalConfig(targetUrl: string, queueitToken: string, queueConfig: QueueEventConfig, customerId: string, secretKey: string, contextProvider: IConnectorContextProvider): RequestValidationResult;
    static validateRequestByIntegrationConfig(currentUrlWithoutQueueITToken: string, queueitToken: string, integrationsConfigString: string, customerId: string, secretKey: string, contextProvider: IConnectorContextProvider): RequestValidationResult;
    static cancelRequestByLocalConfig(targetUrl: string, queueitToken: string, cancelConfig: CancelEventConfig, customerId: string, secretKey: string, contextProvider: IConnectorContextProvider): RequestValidationResult;
}
