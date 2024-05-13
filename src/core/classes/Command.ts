import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { CommandRunFunction } from "../typings/CommandRunFunction";
import { CommandOptions } from "../typings/CommandOptions";

export class Command {
    public readonly data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    public readonly cooldown: number;
    public readonly run: CommandRunFunction;

    constructor(options: CommandOptions) {
        this.data = options.data;
        this.cooldown = options.cooldown ?? 5000;
        this.run = options.run;
    }
}