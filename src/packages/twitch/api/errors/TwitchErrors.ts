export abstract class TwitchError extends Error {
    constructor(code: string, message: string) {
        super(`Encountered an error while interacting with the Twitch API: ${message}`);
        this.cause = {
            code: code
        }
    }
}