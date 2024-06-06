import { NotificationMetadata, WelcomeMetadata } from "../MessageMetadata";
import { NotificationEvents } from "../NotificationEvents";
import { NotificationPayload } from "../payload/NotificationPayload";
import { RevocationPayload } from "../payload/RevocationPayload";
import { SubscriptionConditionMap } from "../subscriptions/Condition";
import { SubscriptionEventMap } from "../subscriptions/events/SubscriptionEvents";

export interface NotificationMessage<T extends NotificationEvents> {
    /**
     * An object that identifies the message.
     */
    metadata: NotificationMetadata;

    /**
     * An object that contains the message.
     */
    payload: NotificationPayload<T>;
}