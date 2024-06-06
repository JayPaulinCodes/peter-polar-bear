import { NotificationEvents } from "../NotificationEvents";
import { SubscriptionConditionMap } from "../subscriptions/Condition";
import { Subscription } from "../subscriptions/Subscription";
import { SubscriptionEventMap } from "../subscriptions/events/SubscriptionEvents";

/**
 * Defines a message that the EventSub WebSocket server sends your client when an event that you subscribe to occurs.
 */
export interface NotificationPayload<T extends NotificationEvents> {
    /**
     * An object that contains information about your subscription.
     */
    subscription: {
        /**
         * An ID that uniquely identifies this subscription.
         */
        id: string;

        /**
         * The subscription’s status, which is set to enabled.
         */
        status: "enabled";

        /**
         * The type of event sent in the message.
         */
        type: string;

        /**
         * The version number of the subscription type’s definition.
         */
        version: string;

        /**
         * The event’s cost.
         */
        cost: number;

        /**
         * The conditions under which the event fires. For example, if you requested notifications 
         * when a broadcaster gets a new follower, this object contains the broadcaster’s ID. For 
         * information about the condition’s data, see the subscription type’s description in Subscription types.
         */
        condition: string;

        /**
         * An object that contains information about the transport used for notifications.
         */
        transport: {
            /**
             * The transport method, which is set to websocket.
             */
            method: "websocket";
            
            /**
             * An ID that uniquely identifies the WebSocket connection.
             */
            session_id: string;
        };

        /**
         * The UTC date and time that the subscription was created.
         */
        created_at: string;
    }

    /**
     * The event’s data. For information about the event’s data, see the subscription type’s description in Subscription Types.
     */
    // event: Subscription<T>;
    event: SubscriptionEventMap[T];
}