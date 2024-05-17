import glob from "glob";
import smush from "@devjacob/smush";
import { Logger } from "@devjacob/logger";
import { format, promisify } from "node:util";
import { Stats } from "node:fs";
import { readdir, rm, stat } from "fs/promises";
import { dirname } from "node:path";
import { AnySelectMenuInteraction, BaseInteraction, ButtonInteraction, ChatInputCommandInteraction, Client, ClientEvents, Collection, ContextMenuCommandInteraction, GatewayIntentBits, ModalSubmitInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody } from "discord.js";
import { Command, ExtendedClientOptions, Event, ContextCommand, toUnixTime, Button, StaticMessage, SelectMenu, errorLog, cardinalToOrdinal } from "@bot/core";
import { DbLogic } from "@bot/database";
import { MysqlError } from "mysql";
import { EmbedHelper } from "@bot/constants";

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
    /**
     * The default options to use when merging the user provided options
     */
    private static readonly DEFAULT_OPTIONS: ExtendedClientOptions = {
        clientOptions: {
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildScheduledEvents,
                GatewayIntentBits.AutoModerationConfiguration,
                GatewayIntentBits.AutoModerationExecution
            ]
        },
        loggerOptions: {
            logLevel: "info",
            output: {
                useZuluTime: false,
                console: {
                    enabled: true
                },
                file: {
                    outputDirectory: "./logs/",
                    enabled: true
                }
            }
        },
        maxLogFiles: 3,
        initFunctions: [],
        folderPaths: {
            commands: format("%s/client/commands/*{.ts,.js}", dirname(require?.main?.filename ?? "Ahh shit")),
            events: format("%s/client/events/*{.ts,.js}", dirname(require?.main?.filename ?? "Ahh shit")),
            contextCommands: format("%s/client/contextCommands/*{.ts,.js}", dirname(require?.main?.filename ?? "Ahh shit")),
            buttons: format("%s/client/buttons/*{.ts,.js}", dirname(require?.main?.filename ?? "Ahh shit")),
            staticMessages: format("%s/client/staticMessages/*{.ts,.js}", dirname(require?.main?.filename ?? "Ahh shit")),
            selectMenus: format("%s/client/selectMenus/*{.ts,.js}", dirname(require?.main?.filename ?? "Ahh shit")),
        }
    }

    /**
     * Array of the commands which will get stringified to register with Discord
     */
    private slashCommands: (RESTPostAPIChatInputApplicationCommandsJSONBody 
        | RESTPostAPIContextMenuApplicationCommandsJSONBody)[] = [];

    /**
     * A collection for custom data storing
     */
    private readonly dataStore: Collection<string, any> = new Collection();

    /**
     * Whether the extended client finished it's initialization
     */
    public initComplete: boolean = false;

    /**
     * The options used to initialize the client
     */
    public readonly extendedOptions: ExtendedClientOptions;

    /**
     * The embed helper to help generate fairly consistient embeds
     */
    public readonly embeds: EmbedHelper;
    
    /**
     * The logger for the client
     */
    public readonly logger: Logger;

    /**
     * A collection for mapping user cooldowns
     */
    public readonly cooldowns: Collection<string, number> = new Collection();

    /**
     * A collection for the registered commands
     */
    public readonly commands: Collection<string, Command> = new Collection();

    /**
     * A collection for the registered context commands
     */
    public readonly contextCommands: Collection<string, ContextCommand> = new Collection();

    /**
     * A collection for the registered buttons
     */
    public readonly buttons: Collection<string, Button> = new Collection();

    /**
     * A collection for the registered static messages
     */
    public readonly staticMessages: Collection<string, StaticMessage> = new Collection();

    /**
     * A collection for the registered select menus
     */
    public readonly selectMenus: Collection<string, SelectMenu> = new Collection();

    /**
     * A collection of the currently registed modal callbacks
     */
    public readonly modalCallbacks: Collection<string, Function> = new Collection();

    /**
     * A collection of the custom ids to ignore when processing interactions
     */
    public readonly ignoredCustomIds: Collection<string, string[]> = new Collection([
        [ "buttons", [] ],
        [ "selectMenus", [] ]
    ]);

    constructor(options: Partial<ExtendedClientOptions> = {}) {
        // Merge the client provided options with the default ones
        const _options: ExtendedClientOptions = <ExtendedClientOptions> smush(ExtendedClient.DEFAULT_OPTIONS, options)

        // Call the Discord.js client constructor with out client options
        super(_options.clientOptions);

        // Assign the options object now that we have finished the super call
        this.extendedOptions = _options;

        // Create our logger
        this.logger = new Logger(this.extendedOptions.loggerOptions);

        // Create the embed helper
        this.embeds = new EmbedHelper(this);
    }

    /**
     * Retrieves the default export from a file.
     * @param {string} filePath The path to the file to import 
     * @returns The default export from the provided file
     */
    private async importFile(filePath: string): Promise<any> {
        return (await import(filePath))?.default;
    }

    /**
     * Scans the commands folder and registers the commands from it
     */
    private async registerCommands(): Promise<void> {
        this.logger.log("Starting to load commands");

        this.logger.debug(format("Scanning for command files in directory %s", this.extendedOptions.folderPaths.commands));
        const files = await globPromise(this.extendedOptions.folderPaths.commands);
        this.logger.debug(format("Found %s file(s) in the command directory", files.length));
        
        for (let i = 0; i < files.length; i++) {
            const filePath = files[i];
            
            this.logger.debug(format("Trying to load command from file %s", filePath));
            const command: Command = await this.importFile(filePath);
            
            if (!command.data) {
                this.logger.warn(format("Failed to load command from file %s because it's missing the 'data' parameter", filePath));
                continue;
            }

            if (!command.data.name) {
                this.logger.warn(format("Failed to load command from file %s because it's missing the 'data.name' parameter", filePath));
                continue;
            }
            
            if (!command.data.description) {
                this.logger.warn(format("Failed to load command from file %s because it's missing the 'data.description' parameter", filePath));
                continue;
            }

            if (!command.run) {
                this.logger.warn(format("Failed to load command from file %s because it's missing the 'run' parameter", filePath));
                continue;
            }

            // Add to commands collection
            this.logger.debug(format("Adding command to collection with key '%s'", command.data.name));
            this.commands.set(command.data.name, command);

            // Add to slash commands array
            this.slashCommands.push(command.data.toJSON());

            this.logger.debug(format("Finished loading %s command", command.data.name));
        }

        this.logger.log(format("Finished loading commands (%s Total)", this.commands.size));
    }

    /**
     * Scans the context commands folder and registers the context commands from it
     */
    private async registerContextCommands(): Promise<void> {
        this.logger.log("Starting to load context commands");

        this.logger.debug(format("Scanning for context command files in directory %s", this.extendedOptions.folderPaths.contextCommands));
        const files = await globPromise(this.extendedOptions.folderPaths.contextCommands);
        this.logger.debug(format("Found %s file(s) in the context command directory", files.length));
        
        for (let i = 0; i < files.length; i++) {
            const filePath = files[i];
            
            this.logger.debug(format("Trying to load context command from file %s", filePath));
            const command: ContextCommand = await this.importFile(filePath);
            
            if (!command.data) {
                this.logger.warn(format("Failed to load context command from file %s because it's missing the 'data' parameter", filePath));
                continue;
            }

            if (!command.data.name) {
                this.logger.warn(format("Failed to load context command from file %s because it's missing the 'data.name' parameter", filePath));
                continue;
            }

            if (!command.run) {
                this.logger.warn(format("Failed to load context command from file %s because it's missing the 'run' parameter", filePath));
                continue;
            }

            // Add to commands collection
            this.logger.debug(format("Adding context command to collection with key '%s'", command.data.name));
            this.contextCommands.set(command.data.name, command);

            // Add to slash commands array
            this.slashCommands.push(command.data.toJSON());

            this.logger.debug(format("Finished loading %s context command", command.data.name));
        }

        this.logger.log(format("Finished loading context command (%s Total)", this.contextCommands.size));
    }

    /**
     * Scans the buttons folder and registers the buttons from it
     */
    private async registerButton(): Promise<void> {
        this.logger.log("Starting to load buttons");

        this.logger.debug(format("Scanning for button files in directory %s", this.extendedOptions.folderPaths.buttons));
        const files = await globPromise(this.extendedOptions.folderPaths.buttons);
        this.logger.debug(format("Found %s file(s) in the button directory", files.length));
        
        for (let i = 0; i < files.length; i++) {
            const filePath = files[i];
            
            this.logger.debug(format("Trying to load button from file %s", filePath));
            const button: Button = await this.importFile(filePath);
            
            if (!button.customIds) {
                this.logger.warn(format("Failed to load button from file %s because it's missing the 'customIds' parameter", filePath));
                continue;
            }

            if (!button.run) {
                this.logger.warn(format("Failed to load button from file %s because it's missing the 'run' parameter", filePath));
                continue;
            }

            // Add to buttons collection
            button.customIds.forEach(id => {
                this.logger.debug(format("Adding button to collection with key '%s'", id));
                this.buttons.set(id, button);
            });

            this.logger.debug(format("Finished loading button for file %s", filePath));
        }

        this.logger.log(format("Finished loading buttons (%s Total)", this.buttons.size));
    }

    /**
     * Scans the select menus folder and registers the menus from it
     */
    private async registerSelectMenus(): Promise<void> {
        this.logger.log("Starting to load select menus");

        this.logger.debug(format("Scanning for select menu files in directory %s", this.extendedOptions.folderPaths.selectMenus));
        const files = await globPromise(this.extendedOptions.folderPaths.selectMenus);
        this.logger.debug(format("Found %s file(s) in the select menu directory", files.length));
        
        for (let i = 0; i < files.length; i++) {
            const filePath = files[i];
            
            this.logger.debug(format("Trying to load select menu from file %s", filePath));
            const menu: SelectMenu = await this.importFile(filePath);
            
            if (!menu.customIds) {
                this.logger.warn(format("Failed to load select menu from file %s because it's missing the 'customIds' parameter", filePath));
                continue;
            }

            if (!menu.run) {
                this.logger.warn(format("Failed to load select menu from file %s because it's missing the 'run' parameter", filePath));
                continue;
            }

            // Add to select menu collection
            menu.customIds.forEach(id => {
                this.logger.debug(format("Adding select menu to collection with key '%s'", id));
                this.selectMenus.set(id, menu);
            });

            this.logger.debug(format("Finished loading select menu for file %s", filePath));
        }

        this.logger.log(format("Finished loading select menus (%s Total)", this.selectMenus.size));
    }

    /**
     * Scans the events folder and registers the events from it
     */
    private async registerEvents(): Promise<void> {
        let loadedEvents = 0;
        this.logger.log("Starting to load events");

        this.logger.debug(format("Scanning for event files in directory %s", this.extendedOptions.folderPaths.events));
        const files = await globPromise(this.extendedOptions.folderPaths.events);
        this.logger.debug(format("Found %s file(s) in the event directory", files.length));

        for (let i = 0; i < files.length; i++) {
            const filePath = files[i];
           
            this.logger.debug(format("Trying to load event from file %s", filePath));
            const event: Event<keyof ClientEvents> = await this.importFile(filePath);

            if (!event.event) {
                this.logger.warn(format("Failed to load event from file %s because it's missing the 'event' parameter", filePath));
                continue;
            }

            if (!event.run) {
                this.logger.warn(format("Failed to load event from file %s because it's missing the 'run' parameter", filePath));
                continue;
            }

            this.logger.debug(format("Registering event to event name '%s'", event.event));
            this.on(event.event, (...args) => event.run(this, ...args));

            loadedEvents++;
            this.logger.debug(format("Finished loading %s event", event.event));
        }

        this.logger.log(format("Finished loading events (%s Total)", loadedEvents));
    }

    /**
     * Scans the static messages folder and registers the static messages from it
     */
    private async registerStaticMessages(): Promise<void> {
        this.logger.log("Starting to load static messages");

        this.logger.debug(format("Scanning for static messages files in directory %s", this.extendedOptions.folderPaths.staticMessages));
        const files = await globPromise(this.extendedOptions.folderPaths.staticMessages);
        this.logger.debug(format("Found %s file(s) in the static message directory", files.length));

        for (let i = 0; i < files.length; i++) {
            const filePath = files[i];
            const staticMessage: StaticMessage = await this.importFile(filePath);
            
            if (!staticMessage.name) {
                this.logger.warn(format("Failed to load static message from file %s because it's missing the 'name' parameter", filePath));
                continue;
            }

            if (!staticMessage.update) {
                this.logger.warn(format("Failed to load static message from file %s because it's missing the 'update' parameter", filePath));
                continue;
            }

            this.logger.debug(format("Adding static message to collection with key '%s'", staticMessage.name));
            this.staticMessages.set(staticMessage.name, staticMessage);

            this.logger.debug(format("Loaded %s static message", staticMessage.name));
        }

        this.logger.log(format("Finished loading static messages (%s Total)", this.staticMessages.size));

        await Promise.all(this.staticMessages.map(elem => elem.update(this)));
    }

    /**
     * Registers the loaded slash commands to discord
     * @param {string | undefined} guildId The guild to register the commands to, or if undefined the commands will register globally
     */
    private async registerSlashCommands(guildId?: string): Promise<void> {
        this.logger.debug("Starting REST registration of slash commands");
        if (guildId) {
            this.guilds.cache.get(guildId)?.commands.set(this.slashCommands);
            this.logger.log(format("Registering commands to guild with id \"%s\"", guildId));
        } else {
            this.logger.debug("Sending data to commands globally: " + JSON.stringify(this.slashCommands));
            this.application?.commands.set(this.slashCommands);
            this.logger.log("Registering commands globally");
        }
    }

    /**
     * Cleans the log files out of the log folder to prevent using excessive amounts of storage
     */
    private async purgeLogFiles(): Promise<void> {
        // Check if file logging was disabled
        if (!this.logger.options.output.file.enabled) {
            this.logger.log("The extended client logger has file logging disabled, no files are being pruged");
            return;
        }

        // Check if we have a limit configured
        if (this.extendedOptions.maxLogFiles === -1) {
            this.logger.log("The extended client has the max file count set to -1, no files are being pruged");
            return;
        }
        this.logger.log("Starting log file purging");

        // Get the date for our metrics logging
        const start = Date.now();

        // Get the dirent's in the folder and filter only the files
        this.logger.debug(format("Scanning for files in the directory %s", this.logger.options.output.file.outputDirectory));
        const logDir = await readdir(this.logger.options.output.file.outputDirectory, { withFileTypes: true });
        this.logger.debug(format("Found %s files in the log output directory", logDir.length));
        const logFileNames = logDir.filter(elem => elem.isFile());

        // Check if we have less files than the max
        if (logFileNames.length <= this.extendedOptions.maxLogFiles) {
            this.logger.log("Finished log file purging, the total file count is bellow the maximum");
            return;
        }

        // Get the file paths
        const logFilePaths = logFileNames.map(elem => format("%s%s", elem.path, elem.name));

        // Get the file stats
        this.logger.debug("Getting stats for the files found");
        const logFiles: { path: string, stats: Stats }[] = await Promise.all(logFilePaths.map(async elem => {
            return {
                path: elem,
                stats: await stat(elem)
            }
        }));

        // Sort the files by creation time
        this.logger.debug("Sorting log files by creation time");
        logFiles.sort((a, b) => b.stats.birthtimeMs - a.stats.birthtimeMs);

        // Delete all files we want to keep from the array
        logFiles.splice(0, this.extendedOptions.maxLogFiles);
        
        // Delete the old files
        this.logger.debug(format("Attempting to delete %s files", logFiles.length));
        await Promise.all(logFiles.map(elem => rm(elem.path)));

        // Log our metrics for the purge
        this.logger.log(format("Purged %s files in %sms", logFiles.length, Date.now() - start));
    }

    private async interactionHandler(client: ExtendedClient, _interaction: BaseInteraction): Promise<void> {
        const handleCommand = async (interaction: ChatInputCommandInteraction) => {
            // Check if the extended client is done with the initialization
            client.logger.debug(format("[ID: %s] Checking if the extended client is done with the initialization", interaction.id));
            if (!client.initComplete) {
                client.logger.log(format("[ID: %s] Stopped processing interaction because the extended client was not done with initialization", interaction.id));
                await interaction.reply({
                    ephemeral: true,
                    content: "The bot is still starting up, please wait"
                });
                return;
            }

            // Check if the executor is a bot
            client.logger.debug(format("[ID: %s] Checking if command executor is a bot", interaction.id));
            const executor = interaction.user;
            if (executor.bot) {
                client.logger.log(format("[ID: %s] Stopped processing interaction because the executor was a bot", interaction.id));
                await interaction.reply({
                    ephemeral: true,
                    content: "Bots cannot execute commands"
                });
                return;
            }

            // Check if the command ran is one that is registered in the bot
            client.logger.debug(format("[ID: %s] Checking if command with name '%s' is registered", interaction.id, interaction.commandName));
            const command = client.commands.get(interaction.commandName);
            if (command === undefined) {
                client.logger.log(format("[ID: %s] Stopped processing interaction because it was not registered", interaction.id));
                await interaction.reply({
                    ephemeral: true,
                    content: "Couldn't find a registered command to execute"
                });
                return;
            }

            // Check if the user is on a command cooldown
            client.logger.debug(format("[ID: %s] Checking if command executor is on a cooldown", interaction.id));
            const cooldown = client.cooldowns.get(executor.id);
            if (cooldown !== undefined) {
                client.logger.debug(format("[ID: %s] Found a cooldown, checking if it's expired", interaction.id));
                // If the cooldown is expired remove it, otherwise stop execution
                if (cooldown <= Date.now()) {
                    client.logger.debug(format("[ID: %s] Cooldown is expired, removing from collection", interaction.id));
                    client.cooldowns.delete(executor.id);
                } else {
                    client.logger.log(format("[ID: %s] Stopped processing interaction because %s (%s) is on a command cooldown", interaction.id, executor.username, executor.id));
                    await interaction.reply({
                        content: format("You're on a command cooldown, try again in <t:%s:R>", toUnixTime(cooldown)),
                        ephemeral: true
                    });
                    return;
                }
            }

            // Try to run the command
            try {
                client.logger.log(format("[ID: %s] %s (%s) is executing the %s command with params %s", interaction.id, executor.username, executor.id, command.data.name, JSON.stringify(interaction.options)));
                await command.run({ client, interaction });
            } catch (err) {
                const error = err as Error;
                client.logger.error(format("[ID: %s] An error occured while trying to execute the command: %s", interaction.id, error.message), error);
                const replyPayload = { 
                    ephemeral: true, 
                    embeds: [ this.embeds.error("An error while using this command!\nThis error has already been reported to the dev team for investigation.\nIf you keep encountering errors please reach out.") ]
                };
                await errorLog(client, error, interaction);

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(replyPayload);
                } else {
                    await interaction.reply(replyPayload);
                }
            } finally {
                // Once the command has been ran, add the user to the cooldown
                client.logger.debug(format("[ID: %s] Adding %s (%s) to the cooldown collection", interaction.id, executor.username, executor.id));
                client.cooldowns.set(executor.id, Date.now() + command.cooldown);
            }
        }
        
        const handleContextCommand = async (interaction: ContextMenuCommandInteraction) => {
            // Check if the extended client is done with the initialization
            client.logger.debug(format("[ID: %s] Checking if the extended client is done with the initialization", interaction.id));
            if (!client.initComplete) {
                client.logger.log(format("[ID: %s] Stopped processing interaction because the extended client was not done with initialization", interaction.id));
                await interaction.reply({
                    ephemeral: true,
                    content: "The bot is still starting up, please wait"
                });
                return;
            }

            // Check if the executor is a bot
            client.logger.debug(format("[ID: %s] Checking if command executor is a bot", interaction.id));
            const executor = interaction.user;
            if (executor.bot) {
                client.logger.log(format("[ID: %s] Stopped processing interaction because the executor was a bot", interaction.id));
                await interaction.reply({
                    ephemeral: true,
                    content: "Bots cannot execute context commands"
                });
                return;
            }

            // Check if the command ran is one that is registered in the bot
            client.logger.debug(format("[ID: %s] Checking if context command with name '%s' is registered", interaction.id, interaction.commandName));
            const command = client.contextCommands.get(interaction.commandName);
            if (command === undefined) {
                client.logger.log(format("[ID: %s] Stopped processing interaction because it was not registered", interaction.id));
                await interaction.reply({
                    ephemeral: true,
                    content: "Couldn't find a registered context command to execute"
                });
                return;
            }

            // Check if the user is on a command cooldown
            client.logger.debug(format("[ID: %s] Checking if context command executor is on a cooldown", interaction.id));
            const cooldown = client.cooldowns.get(executor.id);
            if (cooldown !== undefined) {
                client.logger.debug(format("[ID: %s] Found a cooldown, checking if it's expired", interaction.id));
                // If the cooldown is expired remove it, otherwise stop execution
                if (cooldown <= Date.now()) {
                    client.logger.debug(format("[ID: %s] Cooldown is expired, removing from collection", interaction.id));
                    client.cooldowns.delete(executor.id);
                } else {
                    client.logger.log(format("[ID: %s] Stopped processing interaction because %s (%s) is on a command cooldown", interaction.id, executor.username, executor.id));
                    await interaction.reply({
                        content: format("You're on a command cooldown, try again in <t:%s:R>", toUnixTime(cooldown)),
                        ephemeral: true
                    });
                    return;
                }
            }

            // Try to run the command
            try {
                client.logger.log(format("[ID: %s] %s (%s) is executing the %s command with params %s", interaction.id, executor.username, executor.id, command.data.name, JSON.stringify(interaction.options)));
                await command.run({ client, interaction });
            } catch (err) {
                const error = err as Error;
                client.logger.error(format("[ID: %s] An error occured while trying to execute the command: %s", interaction.id, error.message), error);
                const replyPayload = { 
                    ephemeral: true, 
                    embeds: [ this.embeds.error("An error while using this command!\nThis error has already been reported to the dev team for investigation.\nIf you keep encountering errors please reach out.") ]
                };
                await errorLog(client, error, interaction);
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(replyPayload);
                } else {
                    await interaction.reply(replyPayload);
                }
            } finally {
                // Once the command has been ran, add the user to the cooldown
                client.logger.debug(format("[ID: %s] Adding %s (%s) to the cooldown collection", interaction.id, executor.username, executor.id));
                client.cooldowns.set(executor.id, Date.now() + command.cooldown);
            }
        }
        
        const handleButton = async (interaction: ButtonInteraction) => {
            // Make sure the id isn't ignored
            if (this.ignoredCustomIds.get("buttons")?.includes(interaction.customId)) return;

            // Check if the extended client is done with the initialization
            client.logger.debug(format("[ID: %s] Checking if the extended client is done with the initialization", interaction.id));
            if (!client.initComplete) {
                client.logger.log(format("[ID: %s] Stopped processing interaction because the extended client was not done with initialization", interaction.id));
                await interaction.reply({
                    ephemeral: true,
                    content: "The bot is still starting up, please wait"
                });
                return;
            }

            // Check if the executor is a bot
            client.logger.debug(format("[ID: %s] Checking if button executor is a bot", interaction.id));
            const executor = interaction.user;
            if (executor.bot) {
                client.logger.log(format("[ID: %s] Stopped processing interaction because the executor was a bot", interaction.id));
                await interaction.reply({
                    ephemeral: true,
                    content: "Bots cannot use buttons"
                });
                return;
            }

            // Check if the button used is one that is registered in the bot
            client.logger.debug(format("[ID: %s] Checking if button with custom id '%s' is registered", interaction.id, interaction.customId));
            const button = client.buttons.get(interaction.customId);
            if (button === undefined) {
                client.logger.log(format("[ID: %s] Stopped processing interaction because it was not registered", interaction.id));
                await interaction.reply({
                    ephemeral: true,
                    content: "Couldn't find a registered button to execute"
                });
                return;
            }

            // Check if the user is on a cooldown
            client.logger.debug(format("[ID: %s] Checking if button executor is on a cooldown", interaction.id));
            const cooldown = client.cooldowns.get(executor.id);
            if (cooldown !== undefined) {
                client.logger.debug(format("[ID: %s] Found a cooldown, checking if it's expired", interaction.id));
                // If the cooldown is expired remove it, otherwise stop execution
                if (cooldown <= Date.now()) {
                    client.logger.debug(format("[ID: %s] Cooldown is expired, removing from collection", interaction.id));
                    client.cooldowns.delete(executor.id);
                } else {
                    client.logger.log(format("[ID: %s] Stopped processing interaction because %s (%s) is on a cooldown", interaction.id, executor.username, executor.id));
                    await interaction.reply({
                        content: format("You're on a cooldown, try again in <t:%s:R>", toUnixTime(cooldown)),
                        ephemeral: true
                    });
                    return;
                }
            }

            // Try to run the button logic
            try {
                client.logger.log(format("[ID: %s] %s (%s) is using the %s button", interaction.id, executor.username, executor.id, interaction.customId));
                await button.run({ client, interaction });
            } catch (err) {
                const error = err as Error;
                client.logger.error(format("[ID: %s] An error occured while trying to use the button: %s", interaction.id, error.message), error);
                const replyPayload = { 
                    ephemeral: true, 
                    embeds: [ this.embeds.error("An error while using this command!\nThis error has already been reported to the dev team for investigation.\nIf you keep encountering errors please reach out.") ]
                };
                await errorLog(client, error, interaction);
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(replyPayload);
                } else {
                    await interaction.reply(replyPayload);
                }
            } finally {
                // Once the command has been ran, add the user to the cooldown
                client.logger.debug(format("[ID: %s] Adding %s (%s) to the cooldown collection", interaction.id, executor.username, executor.id));
                client.cooldowns.set(executor.id, Date.now() + button.cooldown);
            }
        }

        const handleModalSubmit = async (interaction: ModalSubmitInteraction) => {
            // Check if the extended client is done with the initialization
            client.logger.debug(format("[ID: %s] Checking if the extended client is done with the initialization", interaction.id));
            if (!client.initComplete) {
                client.logger.log(format("[ID: %s] Stopped processing interaction because the extended client was not done with initialization", interaction.id));
                await interaction.reply({
                    ephemeral: true,
                    content: "The bot is still starting up, please wait"
                });
                return;
            }

            // Check if we have a modal registered with the custom id
            client.logger.debug(format("[ID: %s] Checking if there is a registered modal callback for custom id %s", interaction.id, interaction.customId));
            const callback = client.modalCallbacks.get(interaction.customId);
            if (callback === undefined) {
                client.logger.log(format("[ID: %s] Stopped processing interaction because there was no callback registered for the custom id %s", interaction.id, interaction.customId));
                await interaction.reply({
                    ephemeral: true,
                    content: "There is no callback registed for the modal submitted"
                });
                return;
            }
            
            await callback(client, interaction);
        }
        
        const handleSelectMenu = async (interaction: AnySelectMenuInteraction) => {
            // Make sure the id isn't ignored
            if (this.ignoredCustomIds.get("selectMenus")?.includes(interaction.customId)) return;

            // Check if the extended client is done with the initialization
            client.logger.debug(format("[ID: %s] Checking if the extended client is done with the initialization", interaction.id));
            if (!client.initComplete) {
                client.logger.log(format("[ID: %s] Stopped processing interaction because the extended client was not done with initialization", interaction.id));
                await interaction.reply({
                    ephemeral: true,
                    content: "The bot is still starting up, please wait"
                });
                return;
            }

            // Check if the executor is a bot
            client.logger.debug(format("[ID: %s] Checking if menu executor is a bot", interaction.id));
            const executor = interaction.user;
            if (executor.bot) {
                client.logger.log(format("[ID: %s] Stopped processing interaction because the executor was a bot", interaction.id));
                await interaction.reply({
                    ephemeral: true,
                    content: "Bots cannot use menus"
                });
                return;
            }

            // Check if the select menu used is one that is registered in the bot
            client.logger.debug(format("[ID: %s] Checking if select menu with custom id '%s' is registered", interaction.id, interaction.customId));
            const menu = client.selectMenus.get(interaction.customId);
            if (menu === undefined) {
                client.logger.log(format("[ID: %s] Stopped processing interaction because it was not registered", interaction.id));
                await interaction.reply({
                    ephemeral: true,
                    content: "Couldn't find a registered select menu to execute"
                });
                return;
            }

            // Check if the user is on a cooldown
            client.logger.debug(format("[ID: %s] Checking if select menu executor is on a cooldown", interaction.id));
            const cooldown = client.cooldowns.get(executor.id);
            if (cooldown !== undefined) {
                client.logger.debug(format("[ID: %s] Found a cooldown, checking if it's expired", interaction.id));
                // If the cooldown is expired remove it, otherwise stop execution
                if (cooldown <= Date.now()) {
                    client.logger.debug(format("[ID: %s] Cooldown is expired, removing from collection", interaction.id));
                    client.cooldowns.delete(executor.id);
                } else {
                    client.logger.log(format("[ID: %s] Stopped processing interaction because %s (%s) is on a cooldown", interaction.id, executor.username, executor.id));
                    await interaction.reply({
                        content: format("You're on a cooldown, try again in <t:%s:R>", toUnixTime(cooldown)),
                        ephemeral: true
                    });
                    return;
                }
            }

            // Try to run the menu logic
            try {
                client.logger.log(format("[ID: %s] %s (%s) is using the %s select menu", interaction.id, executor.username, executor.id, interaction.customId));
                await menu.run({ client, interaction });
            } catch (err) {
                const error = err as Error;
                client.logger.error(format("[ID: %s] An error occured while trying to use the select menu: %s", interaction.id, error.message), error);
                const replyPayload = { 
                    ephemeral: true, 
                    embeds: [ this.embeds.error("An error while using this command!\nThis error has already been reported to the dev team for investigation.\nIf you keep encountering errors please reach out.") ]
                };

                await errorLog(client, error, interaction);
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(replyPayload);
                } else {
                    await interaction.reply(replyPayload);
                }
            } finally {
                // Once the logic has been ran, add the user to the cooldown
                client.logger.debug(format("[ID: %s] Adding %s (%s) to the cooldown collection", interaction.id, executor.username, executor.id));
                client.cooldowns.set(executor.id, Date.now() + menu.cooldown);
            }
        }

        if (_interaction.isChatInputCommand()) await handleCommand(_interaction);
        else if (_interaction.isContextMenuCommand()) await handleContextCommand(_interaction);
        else if (_interaction.isButton()) await handleButton(_interaction);
        else if (_interaction.isModalSubmit()) await handleModalSubmit(_interaction);
        else if (_interaction.isAnySelectMenu()) await handleSelectMenu(_interaction);
    }

    public async start(token?: string): Promise<void> {
        this.logger.debug("Starting the client");
        const startupStart = new Date();

        // Load the commands and events at the same time
        this.logger.debug("Loading commands, context commands, events, and buttons");
        await Promise.all([
            this.registerCommands(),
            this.registerContextCommands(),
            this.registerEvents(),
            this.registerButton(),
            this.registerSelectMenus()
        ]);

        // Register the interaction handler
        this.on("interactionCreate", (...args) => this.interactionHandler(this, ...args));

        // Register the one time ready event we want to use to execute init behaviours
        this.logger.debug("Registering one time ready listener");
        this.once("ready", async (botClient: Client) => {
            this.user?.setStatus("dnd");
            this.logger.debug("Discord client is ready, starting initialization process");

            await this.tryPingDatabase(5, true);

            this.logger.debug("Registering slash commands, static messages, and trying to purge log files");
            await Promise.all([
                // Register the slash commands with discord
                this.registerSlashCommands(),
            
                // Register static messages
                this.registerStaticMessages(),
            
                // Clean out log files if we are over the cap
                this.purgeLogFiles(),

                // Any other specified init functions
                ...this.extendedOptions.initFunctions.map(elem => elem(this))
            ]);
            
            this.initComplete = true;
            this.user?.setStatus("online");
            this.logger.log(format("Client startup completed in %s ms", Date.now() - startupStart.getTime()));
        });
        
        // Log in the discord bot
        await this.login(token);
    }

    public async tryPingDatabase(maxAttempts: number = 5, failureIsFatal: boolean = true): Promise<[boolean, number]> {
        return new Promise<[boolean, number]>(async (resolve, reject) => {
            this.logger.log("Trying to ping database");
            let dbPingAttempts = 0;
            let pingComplete = false;
            let encounteredError: MysqlError | undefined = undefined;

            do {
                try {
                    dbPingAttempts++;
                    this.logger.debug(format("Trying %s database ping", cardinalToOrdinal(dbPingAttempts)));
                    await DbLogic.ping();

                    pingComplete = true;
                    this.logger.debug(format("Succeeded databse ping on %s attempt", cardinalToOrdinal(dbPingAttempts)));
                } catch (err) {
                    const error = err as MysqlError;
                    // Make sure we are actually timing out, otherwise we need to throw the error
                    if (error.code === "ETIMEDOUT") {
                        pingComplete = false;
                        this.logger.debug(format("Failed to ping databse on %s attempt", cardinalToOrdinal(dbPingAttempts)));
                    } else {
                        encounteredError = error;
                    }
                }
            } while (!pingComplete && dbPingAttempts < maxAttempts && encounteredError === undefined);

            if (encounteredError !== undefined) {
                this.logger.error("Encountered an error while trying to ping the database.", encounteredError);
                reject(encounteredError);
            }
            
            if (!pingComplete) {
                const logMessage = format("Could not establish connection with database after %s attempts!", dbPingAttempts);
                if (failureIsFatal) {
                    this.logger.fatal(logMessage);
                    reject(new Error("Could not establish connection with database after multiple attempts!"));
                } else {
                    this.logger.error(logMessage);
                }
            } else {
                this.logger.log(format("Successfully pinged the database after %s attempts", dbPingAttempts));
            }

            resolve([pingComplete, dbPingAttempts]);
        });
    }

    public addDataStore(key: string, defaultVal: any): void {
        this.dataStore.set(key, defaultVal);
    }

    public getDataStore<T>(key: string): T | null {
        if (!this.dataStore.has(key)) return null;
        return this.dataStore.get(key) as T;
    }

    public registerModalCallback(identifier: string, callback: (client: ExtendedClient, interaction: ModalSubmitInteraction) => Promise<void>) {
        this.modalCallbacks.set(identifier, async (client: ExtendedClient, interaction: ModalSubmitInteraction) => {
            await callback(client, interaction);
            this.modalCallbacks.delete(identifier);
        });
    }
}