/**
 * Defines the first message that the EventSub WebSocket server sends after your client connects to the server
 */
export interface WelcomePayload {
    /**
     * An object that contains information about the connection.
     */
    session: {

        /**
         * An ID that uniquely identifies this WebSocket connection. Use this ID to set the session_id field in all subscription requests.
         */
        id: string;

        /**
         * The connection’s status, which is set to connected.
         */
        status: string;

        /**
         * The maximum number of seconds that you should expect silence before receiving a keepalive message. 
         * For a welcome message, this is the number of seconds that you have to subscribe to an event after 
         * receiving the welcome message. If you don’t subscribe to an event within this window, the socket is disconnected.
         */
        keepalive_timeout_seconds: number;

        /**
         * The URL to reconnect to if you get a Reconnect message. Is set to null.
         */
        reconnect_url: null;

        /**
         * The UTC date and time that the connection was created.
         */
        connected_at: string;
    }
}