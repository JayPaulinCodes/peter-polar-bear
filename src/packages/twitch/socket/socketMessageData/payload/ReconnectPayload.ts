/**
 * Defines the message that the EventSub WebSocket server sends if the server must drop the connection
 */
export interface ReconnectPayload {
    /**
     * An object that contains information about the connection.
     */
    session: {

        /**
         * An ID that uniquely identifies this WebSocket connection.
         */
        id: string;

        /**
         * The connection’s status, which is set to reconnecting.
         */
        status: "reconnecting";

        /**
         * Is set to null.
         */
        keepalive_timeout_seconds: null;

        /**
         * The URL to reconnect to. Use this URL as is; do not modify it. The 
         * connection automatically includes the subscriptions from the old connection.
         */
        reconnect_url: string;

        /**
         * The UTC date and time that the connection was created.
         */
        connected_at: string;
    }
}