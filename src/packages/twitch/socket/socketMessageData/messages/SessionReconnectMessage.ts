import { WelcomeMetadata } from "../MessageMetadata";
import { ReconnectPayload } from "../payload/ReconnectPayload";

export interface SessionReconnectMessage {
    /**
     * An object that identifies the message.
     */
    metadata: WelcomeMetadata;

    /**
     * An object that contains the message.
     */
    payload: ReconnectPayload;
}