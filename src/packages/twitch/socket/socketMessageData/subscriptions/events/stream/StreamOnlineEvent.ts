export interface StreamOnlineEvent {
    /**
     * The id of the stream.
     */
    id: string;
    
    /**
     * The broadcaster’s user id.
     */
    broadcaster_user_id: string;
    
    /**
     * The broadcaster’s user login.
     */
    broadcaster_user_login: string;
    
    /**
     * The broadcaster’s user display name.
     */
    broadcaster_user_name: string;
    
    /**
     * The stream type
     */
    type: "live" | "playlist" | "watch_party" | "premiere" | "rerun";
    
    /**
     * The timestamp at which the stream went online at.
     */
    started_at: string;
}