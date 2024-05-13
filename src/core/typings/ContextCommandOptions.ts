import { ContextMenuCommandBuilder } from "discord.js";
import { ContextCommandRunFunction } from "@bot/core";

export type ContextCommandOptions = {
    data: ContextMenuCommandBuilder;
    cooldown?: number;
    run: ContextCommandRunFunction;
}