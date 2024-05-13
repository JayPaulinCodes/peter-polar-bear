require("dotenv").config();
import { ActivityType, Collection, GatewayIntentBits, SnowflakeUtil, Utils } from "discord.js";
import { format } from "node:util";
import { ExtendedClient, tryGetChannelByName } from "@bot/core";
import { ChannelName, Constants, Filters } from "@bot/constants";

const client = new ExtendedClient({
    maxLogFiles: 10,
    clientOptions: {
        presence: {
            status: "dnd",
            activities: [ { name: "Over Blaine County", type: ActivityType.Watching } ]
        },
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
        logLevel: process.env.NODE_ENV === "development" ? "debug" : "info",
        output: {
            useZuluTime: false,
            console: {
                enabled: true
            },
            file: {
                enabled: true
            }
        }
    },
    initFunctions: [
        // Chache messages sent in all photo channels in the last 45 days
        async (client: ExtendedClient) => {
            client.logger.log("Caching messages from photo channels sent in the last 45 days");
            const agedSnowflake = SnowflakeUtil.generate({ 
                timestamp: Date.now() - (45 * 24 * 60 * 60 * 1000),
                workerId: 0n,
                processId: 0n
            }).toString();
            const channels = Object.keys(Constants.PhotoChannels).map(elem => tryGetChannelByName(client, elem));
            const filteredChannels = channels.filter(Filters.notEmpty);
            const cachedMessages = await Promise.all(filteredChannels.map(elem => {
                if (elem.isDMBased()) return null;
                if (!elem.isTextBased()) return null;
                return elem.messages.fetch({
                    after: agedSnowflake,
                    cache: true
                });
            }).filter(Filters.notNull));
            client.logger.log(format(
                "Finished caching photo channel messages, cached a total of %s messages", 
                cachedMessages.map(col => col.size).reduce((accumulator, currentValue) => accumulator + currentValue)));
        }
    ]
});

client.ignoredCustomIds.get("buttons")?.push(
    "rideAlongAcceptance_confirm",
    "rideAlongAcceptance_cancel"
);

client.start(process.env.DISCORD_TOKEN);