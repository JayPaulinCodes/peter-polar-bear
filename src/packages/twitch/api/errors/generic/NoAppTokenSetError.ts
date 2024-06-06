import { TwitchError } from "../TwitchErrors";

export class NoAppTokenSetError extends TwitchError {
    constructor() {
        super("MISSING_TOKEN_APP", "No app access token is configured, set one and try again");
    }
}