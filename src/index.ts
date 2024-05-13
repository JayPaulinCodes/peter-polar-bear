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
            activities: [ { name: "The Campfire", type: ActivityType.Watching } ]
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
        logLevel: "debug",
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
    initFunctions: []
});

client.start(process.env.DISCORD_TOKEN);