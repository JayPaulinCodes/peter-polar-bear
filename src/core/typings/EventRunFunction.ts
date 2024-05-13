import { ClientEvents } from "discord.js";
import { ExtendedClient } from "@bot/core";

export type EventRunFunction<Key extends keyof ClientEvents> 
    = (client: ExtendedClient, ...args: ClientEvents[Key]) => void;