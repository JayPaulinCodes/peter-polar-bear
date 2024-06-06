import { NoUserTokenSetError } from "./errors/generic/NoUserTokenSetError";
import { UnspecifiedError } from "./errors/generic/UnspecifiedError";
import { UserDataBody } from "./interfaces/UserDataBody";

export class TwitchAPI {
    private clientId: string | null = null;
    private userAccessToken: string | null = null;
    private appAccessToken: string | null = null;

    public get ready(): boolean {
        return this.userAccessToken !== null || this.appAccessToken !== null;
    }

    public get userTokenConfigured(): boolean {
        return this.userAccessToken !== null;
    }

    public get appTokenConfigured(): boolean {
        return this.appAccessToken !== null;
    }

    private constructor() { }

    public static URL(endpoint: string): string {
        return `https://api.twitch.tv/helix${endpoint}`;
    }

    public static fromClientId(clientId: string): TwitchAPI {
        const newInstance = new TwitchAPI();
        newInstance.clientId = clientId;
        return newInstance;
    }

    public setUserAccessToken(token: string | null): TwitchAPI {
        this.userAccessToken = token;
        return this;
    }

    public setAppAccessToken(token: string | null): TwitchAPI {
        this.appAccessToken = token;
        return this;
    }

    public setAccessTokens(userToken: string | null, appToken: string | null): TwitchAPI {
        return this.setUserAccessToken(userToken).setAppAccessToken(appToken);
    }

    public async getUsersById(id: string | string[]): Promise<[boolean, UserDataBody[] | null]> {
        // Check for the access token
        if (!this.userTokenConfigured && !this.appTokenConfigured) { throw new NoUserTokenSetError(); }

        // Send the request
        const response = await fetch(TwitchAPI.URL(`/users?${Array.isArray(id) ? id.map(_id => `id=${_id}`).join("&") : `id=${id}`}`), {
            method: "GET",
            headers: [
                [ "Authorization", `Bearer ${this.userAccessToken ?? this.appAccessToken}` ],
                [ "Client-Id", this.clientId ?? "" ],
                [ "Content-Type", "application/json" ],
            ]
        });

        // Process the response data
        const data = await response.json();
        switch (response.status) {
            case 200:
                return [ true, data.data as UserDataBody[] ];

            case 400:
            case 401:
                throw new UnspecifiedError(`${data.status} - ${data.message}`);

            default: 
                return [ false, null ];
        }
    } 

    public async getUsersByHandle(handle: string | string[]): Promise<[boolean, UserDataBody[] | null]> {
        // Check for the access token
        if (!this.userTokenConfigured && !this.appTokenConfigured) { throw new NoUserTokenSetError(); }

        // Send the request
        const response = await fetch(TwitchAPI.URL(`/users?${Array.isArray(handle) ? handle.map(_handle => `login=${_handle}`).join("&") : `login=${handle}`}`), {
            method: "GET",
            headers: [
                [ "Authorization", `Bearer ${this.userAccessToken ?? this.appAccessToken}` ],
                [ "Client-Id", this.clientId ?? "" ],
                [ "Content-Type", "application/json" ],
            ]
        });

        // Process the response data
        const data = await response.json();
        switch (response.status) {
            case 200:
                return [ true, data.data as UserDataBody[] ];

            case 400:
            case 401:
                throw new UnspecifiedError(`${data.status} - ${data.message}`);

            default: 
                return [ false, null ];
        }
    } 
}