import { AnySelectMenuInteraction } from "discord.js";
import { ExtendedClient } from "@bot/core";

export interface SelectMenuRunOptions {
    client: ExtendedClient;
    interaction: AnySelectMenuInteraction;
}