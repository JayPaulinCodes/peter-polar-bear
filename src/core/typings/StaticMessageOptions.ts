import { StaticMessageUpdateFunction } from "@bot/core";

export type StaticMessageOptions = {
    name: string;
    updateDelay?: number;
    update: StaticMessageUpdateFunction;
}