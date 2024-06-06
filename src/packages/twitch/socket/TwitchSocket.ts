require("dotenv").config();
import { WebSocket, MessageEvent } from "ws";
import { EventEmitter } from "events";
import { NotificationEvents, NotificationMessageType, SubTypeEventNameMap } from "./socketMessageData/NotificationEvents";
import { NotificationMessage } from "./socketMessageData/messages/NotificationMessage";
import { WebsocketMessage } from "./socketMessageData/WebsocketMessage";
import { CloseMessage } from "./socketMessageData/messages/CloseMessage";
import { PingMessage } from "./socketMessageData/messages/PingMessage";
import { RevocationMessage } from "./socketMessageData/messages/RevocationMessage";
import { SessionWelcomeMessage } from "./socketMessageData/messages/SessionWelcomeMessage";
import { SessionReconnectMessage } from "./socketMessageData/messages/SessionReconnectMessage";
import { SessionKeepaliveMessage } from "./socketMessageData/messages/SessionKeepaliveMessage";
import { SubscriptionNameConditionKeyMap, SubscriptionType } from "./socketMessageData/subscriptions/SubscriptionName";
import { SubscriptionCondition, SubscriptionConditionMap } from "./socketMessageData/subscriptions/Condition";
import { SubscriptionMetadata } from "./socketMessageData/subscriptions/SubscriptionMetadata";
import { TwitchAPI } from "../api/TwitchAPI";

export declare interface TwitchSocket {
    addListener<Event extends NotificationEvents>(event: Event, listener: (data: NotificationMessage<Event>) => void): this;
    on<Event extends NotificationEvents>(event: Event, listener: (data: NotificationMessage<Event>) => void): this;
    once<Event extends NotificationEvents>(event: Event, listener: (data: NotificationMessage<Event>) => void): this;
    removeListener<Event extends NotificationEvents>(event: Event, listener: (data: NotificationMessage<Event>) => void): this;
    off<Event extends NotificationEvents>(event: Event, listener: (data: NotificationMessage<Event>) => void): this;
}

export class TwitchSocket extends EventEmitter {
    private socket: WebSocket;
    private _api: TwitchAPI;
    private clientId: string;
    private clientSecret: string;
    private clientAccessToken: string;
    
    private handleBroadcasterId: { [key: string]: string } = {};
    private subscriptions: { [id: string]: SubscriptionMetadata<any> } = {};
    private sessionId: string | null = null;
    private accessToken: string | null = null;
    private accessTokenExpires: Date | null = null;

    constructor(options: {
        clientId: string;
        clientSecret: string;
        clientAccessToken: string;
        apiInstance?: TwitchAPI;
    }) {
        super();
        this.clientId = options.clientId;
        this.clientSecret = options.clientSecret;
        this.clientAccessToken = options.clientAccessToken;
        this._api = options?.apiInstance ?? TwitchAPI.fromClientId(this.clientId).setUserAccessToken(this.clientAccessToken);

        this.socket = new WebSocket("wss://eventsub.wss.twitch.tv/ws");
        this.socket.addEventListener("message", this.processMessage.bind(this));
    }

    public get connected(): boolean { 
        return this.socket.readyState === 1; 
    }

    public get api(): TwitchAPI {
        return this._api;
    }

    private processMessage(data: MessageEvent) {
        const message: WebsocketMessage = JSON.parse(data.data.toString());

        switch (message.metadata.message_type) {
            case "session_welcome":
                this.onSocketSessionWelcomeMessage(message as SessionWelcomeMessage);
                break;
                
            case "session_keepalive": 
                this.onSocketSessionKeepaliveMessage(message as SessionKeepaliveMessage);
                break;
            
            case "ping": 
                this.onSocketPingMessage(message as PingMessage);
                break;
                
            case "notification": 
                this.onSocketNotificationMessage(message as NotificationMessageType);
                break;
            
            case "session_reconnect": 
                this.onSocketSessionReconnectMessage(message as SessionReconnectMessage);
                break;
                
            case "revocation": 
                this.onSocketRevocationMessage(message as RevocationMessage);
                break;
            
            case "close": 
                this.onSocketCloseMessage(message as CloseMessage);
                break;

            default: break;
        }
    }

    private onSocketCloseMessage(message: CloseMessage): void {
        console.log("close", message);

    }

    private onSocketPingMessage(message: PingMessage): void {
        console.log("ping", message);
    }

    private onSocketRevocationMessage(message: RevocationMessage): void {
        // console.log("revocation", message);
        
    }

    private onSocketSessionKeepaliveMessage(message: SessionKeepaliveMessage): void {
        // console.log("session_keepalive", message);
        
    }

    private onSocketSessionReconnectMessage(message: SessionReconnectMessage): void {
        // console.log("session_reconnect", message);
        
    }

    private async onSocketSessionWelcomeMessage(message: SessionWelcomeMessage): Promise<void> {
        // console.log("session_welcome", message);
        this.sessionId = message.payload.session.id;
        
        await this.refreshAccessToken();
        await this.refreshActiveSubscriptions();

        const oldSubs = Object.entries(this.subscriptions).filter(sub => sub[1].status !== "enabled").map(sub => sub[0]);
        for (let i = 0; i < oldSubs.length; i++) {
            await this.tryDeleteSubscription(oldSubs[i]);
        }

        await this.refreshActiveSubscriptions();
    }

    private onSocketNotificationMessage(message: any): void {
        // console.log("notification", message);
        
        const eventName = SubTypeEventNameMap[message.metadata.subscription_type];
        this.emit(eventName, message);
    }

    private async refreshAccessToken() {
        // Check if the token is expired
        if (this.accessTokenExpires !== null && new Date() >= this.accessTokenExpires) { return; }

        // Build the url and send the request
        const url = `https://id.twitch.tv/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`;
        const response = await fetch(url, { method: "POST" });
        
        // Validate the response and update fields
        if (response.ok) {
            const data = await response.json();
    
            this.accessToken = data?.access_token;
            this.accessTokenExpires = new Date(Date.now() + (data?.expires_in ?? 0));
        } else {
            this.accessToken = null;
            this.accessTokenExpires = null;
        }
        console.log("Refreshed access token", this.accessToken, this.accessTokenExpires);
    }

    private async refreshActiveSubscriptions(): Promise<void> {
        // Check if the token is expired
        if (this.accessTokenExpires !== null && new Date() >= this.accessTokenExpires) { await this.refreshAccessToken(); }

        const response = await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
            method: "GET",
            headers: [
                [ "Authorization", `Bearer ${this.clientAccessToken}` ],
                [ "Client-Id", this.clientId ],
                [ "Content-Type", "application/json" ],
            ]
        });

        // Validate the response and update fields
        if (response.ok) {
            const data = await response.json();
            const subs: any[] = data.data;
            this.subscriptions = Object.fromEntries(subs.map(item => [ item.id, item ]));
            return;
        } else {
            return;
        }
    }

    private async tryCreateSubscription(type: SubscriptionType, condition: SubscriptionCondition): Promise<boolean> {
        // Check if the token is expired
        if (this.accessTokenExpires !== null && new Date() >= this.accessTokenExpires) { await this.refreshAccessToken(); }

        const v2Types: SubscriptionType[] = [ "channel.follow", "channel.update" ];
        const betaTypes: SubscriptionType[] = [ "channel.guest_star_session.begin", "channel.guest_star_session.end", "channel.guest_star_guest.update", "channel.guest_star_settings.update" ];
        const version = v2Types.includes(type) 
            ? "2"
            : betaTypes.includes(type)
                ? "beta"
                : "1";

        // Build send the request
        const response = await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
            method: "POST",
            headers: [
                [ "Authorization", `Bearer ${this.clientAccessToken}` ],
                [ "Client-Id", this.clientId ],
                [ "Content-Type", "application/json" ],
            ],
            body: JSON.stringify({
                type: type,
                version: version,
                condition: condition,
                transport: {
                    method: "websocket",
                    session_id: this.sessionId
                }
            })
        });

        // Validate the response and update fields
        if (response.ok) {
            const data = await response.json();
            return data?.data?.[0]?.status === "enabled";
        } else {
            return false;
        }
    }

    private async tryDeleteSubscription(id: string): Promise<void> {
        // Check if the token is expired
        if (this.accessTokenExpires !== null && new Date() >= this.accessTokenExpires) { await this.refreshAccessToken(); }

        // Build send the request
        const response = await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`, {
            method: "DELETE",
            headers: [
                [ "Authorization", `Bearer ${this.clientAccessToken}` ],
                [ "Client-Id", this.clientId ],
                [ "Content-Type", "application/json" ],
            ]
        });
    }

    public async tryGetBroadcastIdForHandle(handle: string): Promise<string | null> {
        // Check if the token is expired
        if (this.handleBroadcasterId?.[handle] !== undefined) { return this.handleBroadcasterId[handle]; }

        // Build the url and send the request
        const url = `https://api.twitch.tv/helix/users?login=${handle.toLowerCase()}`;
        const response = await fetch(url, {
            method: "GET",
            headers: [
                [ "Authorization", `Bearer ${this.clientAccessToken}` ],
                [ "Client-Id", this.clientId ],
                [ "Content-Type", "application/json" ],
            ],
        });
        
        // Validate the response and update fields
        if (response.ok) {
            const data = await response.json();
            
            const id = data?.data?.[0]?.id ?? null;
            if (id !== null) { this.handleBroadcasterId[handle] = id; }
            return id;
        } else {
            return null;
        }
    }

    public async tryAddSteamOnlineSub(handleOrId: string, usingBroadcastId: boolean = false): Promise<boolean> {
        // Check if the token is expired
        if (this.accessTokenExpires !== null && new Date() >= this.accessTokenExpires) { await this.refreshAccessToken(); }

        let broadcasterId = handleOrId;
        if (!usingBroadcastId) {
            const [ _, data ] = await this.api.getUsersByHandle(handleOrId);
            broadcasterId = data?.[0]?.id ?? handleOrId;
        }

        // Build send the request
        const response = await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
            method: "POST",
            headers: [
                [ "Authorization", `Bearer ${this.clientAccessToken}` ],
                [ "Client-Id", this.clientId ],
                [ "Content-Type", "application/json" ],
            ],
            body: JSON.stringify({
                type: "stream.online",
                version: "1",
                condition: {
                    broadcaster_user_id: broadcasterId
                },
                transport: {
                    method: "websocket",
                    session_id: this.sessionId
                }
            })
        });

        // Validate the response and update fields
        if (response.ok) {
            const data = await response.json();
            return data?.data?.[0]?.status === "enabled";
        } else {
            return false;
        }
    }
}