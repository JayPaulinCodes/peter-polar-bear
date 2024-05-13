import { BaseMessageOptions, GuildTextBasedChannel, Message } from "discord.js";
import { ExtendedClient, StaticMessage, homeGuildId, tryGetChannelByName } from "@bot/core";
import { DbLogic } from "@bot/database";
import { ChannelName, Constants } from "@bot/constants";

export default new StaticMessage({
    name: "ftoRideAlongQueue",
    updateDelay: 15 * 60 * 1000,
    update: async (client: ExtendedClient) => {
        client.logger.debug("Starting update for static message 'ftoRideAlongQueue'");
        const GUILD_ID = homeGuildId();
        const CHANNEL_ID = tryGetChannelByName(client, ChannelName.RIDE_ALONG_REQUEST)?.id ?? "1175869166117453866";
        const DB_NAME = "ftoRideAlongQueue";

        const dbRideAlongs = await DbLogic.getAllFtoRideAlongs();
        dbRideAlongs.sort((a, b) => a.queuePos - b.queuePos);

        const embed = client.embeds.ftoRideAlong(dbRideAlongs);
        const messageContent: BaseMessageOptions = {
            embeds: [ embed ],
            components: Constants.RideAlongActions
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

        client.logger.log("Finished update for static message 'ftoRideAlongQueue'");
    }
});
