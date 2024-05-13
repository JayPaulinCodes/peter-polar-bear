import { ClientOptions } from "discord.js";
import { PartialLoggerOptions } from "@devjacob/logger";
import { ExtendedClient } from "@bot/core";

export interface ExtendedClientOptions {
    /**
     * The options object passed to the Discord.JS client
     */
    clientOptions: ClientOptions;

    /**
     * The options used to initialize the logger
     */
    loggerOptions: PartialLoggerOptions;

    /**
     * The maximum amount of log files that can be in the log folder.
     * 
     * Defaults to 25, -1 will allow no limit
     */
    maxLogFiles: number;

    /**
     * Functions to run with the initialization of the client
     */
    initFunctions: ((client: ExtendedClient) => Promise<void>)[];

    folderPaths: {
        /**
         * The path to the commands folder
         */
        commands: string,

        /**
         * The path to the events folder
         */
        events: string,

        /**
         * The path to the context commands folder
         */
        contextCommands: string,

        /**
         * The path to the buttons folder
         */
        buttons: string,

        /**
         * The path to the staticMessages folder
         */
        staticMessages: string,

        /**
         * The path to the select menus folder
         */
        selectMenus: string,
    }
}