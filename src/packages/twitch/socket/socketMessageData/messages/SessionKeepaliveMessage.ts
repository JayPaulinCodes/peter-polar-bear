import { WelcomeMetadata } from "../MessageMetadata";
import { KeepalivePayload } from "../payload/KeepalivePayload";

export interface SessionKeepaliveMessage {
    /**
     * An object that identifies the message.
     */
    metadata: WelcomeMetadata;

    /**
     * An object that contains the message.
     */
    payload: KeepalivePayload;
}