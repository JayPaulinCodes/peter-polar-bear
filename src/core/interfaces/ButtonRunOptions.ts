import { ButtonInteraction } from "discord.js";
import { ExtendedClient } from "@bot/core";

export interface ButtonRunOptions {
    client: ExtendedClient;
    interaction: ButtonInteraction;
}