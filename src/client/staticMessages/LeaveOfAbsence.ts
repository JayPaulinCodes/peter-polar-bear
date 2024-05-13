import { BaseMessageOptions, GuildTextBasedChannel, Message } from "discord.js";
import { ExtendedClient, StaticMessage, homeGuildId, tryGetChannelByName } from "@bot/core";
import { DbLogic } from "@bot/database";
import { ChannelName, Constants } from "@bot/constants";

export default new StaticMessage({
    name: "leaveOfAbsence",
    updateDelay: 30 * 60 * 1000,
    update: async (client: ExtendedClient) => {
        client.logger.debug("Starting update for static message 'leaveOfAbsence'");
        const GUILD_ID = homeGuildId();
        const CHANNEL_ID = tryGetChannelByName(client, ChannelName.LEAVE_OF_ABSENCES)?.id ?? "1176655648197443614";
        const DB_NAME = "leaveOfAbsence";

        

        const embed = client.embeds.loa();
        const messageContent: BaseMessageOptions = {
            embeds: [ embed ],
            components: [ Constants.LoaActions ]
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

        client.logger.log("Finished update for static message 'leaveOfAbsence'");
    }
});
