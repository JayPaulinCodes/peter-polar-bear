import { ClientEvents } from "discord.js";
import { EventRunFunction } from "../typings/EventRunFunction";

export class Event<Key extends keyof ClientEvents> {
    public readonly event: Key;
    public readonly run: EventRunFunction<Key>;

    constructor(event: Key, run: EventRunFunction<Key>) {
        this.event = event;
        this.run = run;
    }
}