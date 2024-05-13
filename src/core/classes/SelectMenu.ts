import { SelectMenuOptions, SelectMenuRunFunction } from "@bot/core";

export class SelectMenu {
    public readonly customIds: string[];
    public readonly cooldown: number;
    public readonly run: SelectMenuRunFunction;

    constructor(options: SelectMenuOptions) {
        this.customIds = Array.isArray(options.customIds) ? options.customIds : [ options.customIds ];
        this.cooldown = options.cooldown ?? 5000;
        this.run = options.run;
    }
}