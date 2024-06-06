import { WelcomeMetadata } from "../MessageMetadata";
import { RevocationPayload } from "../payload/RevocationPayload";

export interface RevocationMessage {
    /**
     * An object that identifies the message.
     */
    metadata: WelcomeMetadata;

    /**
     * An object that contains the message.
     */
    payload: RevocationPayload;
}