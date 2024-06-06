import { NotificationMessageType } from "./NotificationEvents";
import { CloseMessage } from "./messages/CloseMessage";
import { PingMessage } from "./messages/PingMessage";
import { RevocationMessage } from "./messages/RevocationMessage";
import { SessionKeepaliveMessage } from "./messages/SessionKeepaliveMessage";
import { SessionReconnectMessage } from "./messages/SessionReconnectMessage";
import { SessionWelcomeMessage } from "./messages/SessionWelcomeMessage";

export type WebsocketMessage = CloseMessage 
    | NotificationMessageType[keyof NotificationMessageType]
    | PingMessage
    | RevocationMessage
    | SessionKeepaliveMessage
    | SessionReconnectMessage
    | SessionWelcomeMessage;