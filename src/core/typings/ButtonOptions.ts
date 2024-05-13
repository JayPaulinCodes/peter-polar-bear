import { ButtonRunFunction } from "@bot/core";

export type ButtonOptions = {
    customIds: string | string[];
    cooldown?: number;
    run: ButtonRunFunction;
}