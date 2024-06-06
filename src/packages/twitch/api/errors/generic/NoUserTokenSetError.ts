import { TwitchError } from "../TwitchErrors";

export class NoUserTokenSetError extends TwitchError {
    constructor() {
        super("MISSING_TOKEN_USER", "No user access token is configured, set one and try again");
    }
}