import { ButtonOptions, ButtonRunFunction, ContextCommandRunFunction } from "@bot/core";

export class Button {
    public readonly customIds: string[];
    public readonly cooldown: number;
    public readonly run: ButtonRunFunction;

    constructor(options: ButtonOptions) {
        this.customIds = Array.isArray(options.customIds) ? options.customIds : [ options.customIds ];
        this.cooldown = options.cooldown ?? 5000;
        this.run = options.run;
    }
}