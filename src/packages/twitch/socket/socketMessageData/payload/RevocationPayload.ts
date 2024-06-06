/**
 * Defines the message that the EventSub WebSocket server sends if the user no longer exists or 
 * they revoked the authorization token that the subscription relied on.
 */
export interface RevocationPayload {
    /**
     * An object that contains information about your subscription.
     */
    subscription: {
        /**
         * An ID that uniquely identifies this subscription.
         */
        id: string;

        /**
         * The subscription's status. The following are the possible values:
         *     - authorization_revoked — The user in the condition object revoked the authorization that let you get events on their behalf.
         *     - user_removed — The user in the condition object is no longer a Twitch user.
         *     - version_removed — The subscribed to subscription type and version is no longer supported.
         */
        status: "authorization_revoked" | "user_removed" | "version_removed";

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
}