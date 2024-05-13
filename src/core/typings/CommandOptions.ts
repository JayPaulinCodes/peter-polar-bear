import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { CommandRunFunction } from "@bot/core";

export type CommandOptions = {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    cooldown?: number;
    run: CommandRunFunction;
}