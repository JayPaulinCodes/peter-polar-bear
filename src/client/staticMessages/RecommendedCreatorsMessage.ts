import { BaseMessageOptions, GuildTextBasedChannel, Message } from "discord.js";
import { ExtendedClient, StaticMessage, homeGuildId, tryGetChannelByName, tryGetRoleByName } from "@bot/core";
import { DbLogic } from "@bot/database";
import { ChannelName, ComponentHelper, RecommendedCreatorsEmbed, RoleName, RoleShopEmbed } from "@bot/constants";

export default new StaticMessage({
    name: "recommendedCreatorsMessage",
    update: async (client: ExtendedClient) => {
        client.logger.debug("Starting update for static message 'recommendedCreatorsMessage'");
        const GUILD_ID = homeGuildId();
        const CHANNEL_ID = tryGetChannelByName(client, ChannelName.CONTENT_UPDATES)?.id ?? "1239668475140509777";
        const DB_NAME = "recommendedCreatorsMessage";

        const allCreators = await DbLogic.getAllRecommendedCreators();

        const messageContent: BaseMessageOptions = {
            embeds: [ new RecommendedCreatorsEmbed(allCreators) ]
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
            await newMessage.pin();
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

        client.logger.log("Finished update for static message 'recommendedCreatorsMessage'");
    }
});
