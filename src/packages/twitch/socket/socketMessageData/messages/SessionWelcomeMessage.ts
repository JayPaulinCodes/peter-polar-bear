import { WelcomeMetadata } from "../MessageMetadata";
import { WelcomePayload } from "../payload/WelcomePayload";

export interface SessionWelcomeMessage {
    /**
     * An object that identifies the message.
     */
    metadata: WelcomeMetadata;

    /**
     * An object that contains the message.
     */
    payload: WelcomePayload;
}