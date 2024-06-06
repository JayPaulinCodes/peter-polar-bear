import { TwitchError } from "../TwitchErrors";

export class InvalidBroadcasterError extends TwitchError {
    constructor(broadcasterId: string) {
        super("BAD_BROADCASTER", `No broadcaster with id "${broadcasterId}" was found`);
    }
}