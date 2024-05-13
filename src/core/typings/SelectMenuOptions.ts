import { SelectMenuRunFunction } from "@bot/core";

export type SelectMenuOptions = {
    customIds: string | string[];
    cooldown?: number;
    run: SelectMenuRunFunction;
}