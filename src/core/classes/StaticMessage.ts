import { setTimeout } from "timers";
import { ExtendedClient, StaticMessageOptions, StaticMessageUpdateFunction } from "@bot/core";

export class StaticMessage {
    public readonly name: string;
    public readonly updateDelay?: number;
    private readonly _update: StaticMessageUpdateFunction;
    private timeout?: NodeJS.Timeout;

    constructor(options: StaticMessageOptions) {
        this.name = options.name;
        this.updateDelay = options.updateDelay;
        this._update = options.update.bind(this);
    }

    public async update(client: ExtendedClient): Promise<void> {
        await this._update(client);
        
        if (this.timeout !== undefined) {
            this.timeout.refresh();
        } else if (this.updateDelay !== undefined) {
            this.timeout = setTimeout(async () => await client.staticMessages.get(this.name)?.update(client), this.updateDelay);
        }
    }
}