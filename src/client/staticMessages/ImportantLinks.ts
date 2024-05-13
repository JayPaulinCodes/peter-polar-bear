import { BaseMessageOptions, GuildTextBasedChannel, Message } from "discord.js";
import { ExtendedClient, StaticMessage, homeGuildId, tryGetChannelByName } from "@bot/core";
import { DbLogic } from "@bot/database";
import { ChannelName } from "@bot/constants";

export default new StaticMessage({
    name: "importantLinks",
    update: async (client: ExtendedClient) => {
        client.logger.debug("Starting update for static message 'importantLinks'");
        const GUILD_ID = homeGuildId();
        const CHANNEL_ID = tryGetChannelByName(client, ChannelName.IMPORTANT_LINKS)?.id ?? "1176655816644886678";
        const DB_NAME = "importantLinks";

        const [ embedBcso, attachmentBcso ] = client.embeds.importantLinksBcso();
        const [ embedWsu, attachmentWsu ] = await client.embeds.importantLinksWsu();
        const [ embedWlr, attachmentWlr ] = await client.embeds.importantLinksWlr();
        const [ embedTed, attachmentTed ] = await client.embeds.importantLinksTed();
        const [ embedCid, attachmentCid ] = await client.embeds.importantLinksCid();
        const [ embedK9, attachmentK9 ] = await client.embeds.importantLinksK9();
        const messageContent: BaseMessageOptions = {
            embeds: [ 
                embedBcso,
                embedWsu,
                embedWlr,
                embedTed,
                embedCid,
                embedK9
            ],
            files: [
                attachmentBcso,
                attachmentWsu,
                attachmentWlr,
                attachmentTed,
                attachmentCid,
                attachmentK9
            ]
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

        client.logger.log("Finished update for static message 'importantLinks'");
    }
});
