import { BaseMessageOptions, GuildTextBasedChannel, Message } from "discord.js";
import { ExtendedClient, StaticMessage, homeGuildId, tryGetChannelByName } from "@bot/core";
import { DbLogic } from "@bot/database";
import { ChannelName } from "@bot/constants";

export default new StaticMessage({
    name: "askCocWlr",
    updateDelay: 30 * 60 * 1000,
    update: async (client: ExtendedClient) => {
        client.logger.debug("Starting update for static message 'askCocWlr'");
        const GUILD_ID = homeGuildId();
        const CHANNEL_ID = tryGetChannelByName(client, ChannelName.WLR_ASK_COC)?.id ?? "1176658796668522496";
        const DB_NAME = "askCocWlr";

        const [ embed, attachment ] = client.embeds.subdivisionCoC(await client.guilds.fetch(GUILD_ID), "WLR");
        const messageContent: BaseMessageOptions = {
            embeds: [ embed ],
            files: [ attachment ]
        }
        
        const dbItem = await DbLogic.getStaticMessage(DB_NAME);

        const guild = await client.guilds.fetch(GUILD_ID);
        const channel = <GuildTextBasedChannel | null> await guild.channels.fetch(CHANNEL_ID);
        if (channel === null) return;

        let message: Message | undefined = undefined;
        if (dbItem !== null) {
            try {
                message = await channel.messages.fetch(dbItem.messageId);
            } catch (err) {
                message = undefined;
            }
        }

        if (message === undefined) {
            const newMessage = await channel.send(messageContent);
            if (dbItem === null) {
                await DbLogic.createStaticMessage(DB_NAME, guild.id, channel.id, newMessage.id);
            } else {
                await DbLogic.updateStaticMessage({
                    ...dbItem,
                    messageId: newMessage.id
                });
            }
        } else {
            await message.edit(messageContent);
        }

        client.logger.log("Finished update for static message 'askCocWlr'");
    }
});
