import { ContextMenuCommandInteraction } from "discord.js";
import { ExtendedClient } from "@bot/core";

export interface ContextCommandRunOptions {
    client: ExtendedClient;
    interaction: ContextMenuCommandInteraction;
}