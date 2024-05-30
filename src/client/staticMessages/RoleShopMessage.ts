import { BaseMessageOptions, GuildTextBasedChannel, Message } from "discord.js";
import { ExtendedClient, StaticMessage, homeGuildId, tryGetChannelByName, tryGetRoleByName } from "@bot/core";
import { DbLogic } from "@bot/database";
import { ChannelName, ComponentHelper, RoleName, RoleShopEmbed } from "@bot/constants";

export default new StaticMessage({
    name: "roleShopMessage",
    update: async (client: ExtendedClient) => {
        client.logger.debug("Starting update for static message 'roleShopMessage'");
        const GUILD_ID = homeGuildId();
        const CHANNEL_ID = tryGetChannelByName(client, ChannelName.ROLE_SHOP)?.id ?? "1239590385165012992";
        const DB_NAME = "roleShopMessage";

        const messageContent: BaseMessageOptions = {
            embeds: [ new RoleShopEmbed(client) ],
            components: [ ComponentHelper.roleShopButtons() ]
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

        client.logger.log("Finished update for static message 'roleShopMessage'");
    }
});
