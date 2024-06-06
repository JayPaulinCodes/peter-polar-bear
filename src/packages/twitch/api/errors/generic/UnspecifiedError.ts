import { TwitchError } from "../TwitchErrors";

export class UnspecifiedError extends TwitchError {
    constructor(message: string) {
        super("UNSPECIFIED", `An unspecified error occured: ${message}`);
    }
}