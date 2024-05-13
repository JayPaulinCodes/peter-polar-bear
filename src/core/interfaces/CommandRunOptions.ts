import { CommandInteraction } from "discord.js";
import { ExtendedClient } from "@bot/core";

export interface CommandRunOptions {
    client: ExtendedClient;
    interaction: CommandInteraction;
}