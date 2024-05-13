import { ExtendedClient } from "@bot/core";

export type StaticMessageUpdateFunction = (client: ExtendedClient) => Promise<void>