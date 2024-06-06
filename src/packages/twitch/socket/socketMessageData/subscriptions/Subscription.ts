import { NotificationEvents } from "../NotificationEvents";
import { SubscriptionConditionMap } from "./Condition";
import { SubscriptionMetadata } from "./SubscriptionMetadata";
import { SubscriptionEventMap } from "./events/SubscriptionEvents";

export interface Subscription<T extends NotificationEvents> {
    /**
     * Metadata about the subscription
     */
    subscription: SubscriptionMetadata<T>;

    /**
     * The event information.
     */
    event: SubscriptionEventMap[T];
}