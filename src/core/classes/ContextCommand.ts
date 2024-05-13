import { ContextCommandOptions, ContextCommandRunFunction } from "@bot/core";
import { ContextMenuCommandBuilder } from "discord.js";

export class ContextCommand {
    public readonly data: ContextMenuCommandBuilder;
    public readonly cooldown: number;
    public readonly run: ContextCommandRunFunction;

    constructor(options: ContextCommandOptions) {
        this.data = options.data;
        this.cooldown = options.cooldown ?? 5000;
        this.run = options.run;
    }
}