import { BaseMessageOptions, GuildTextBasedChannel, Message } from "discord.js";
import { ExtendedClient, StaticMessage, homeGuildId, tryFindEmoji, tryGetChannelByName, tryGetRoleByName } from "@bot/core";
import { DbLogic } from "@bot/database";
import { ChannelName, Constants, RoleName } from "@bot/constants";

export default new StaticMessage({
    name: "rideAlongRequest",
    update: async (client: ExtendedClient) => {
        client.logger.debug("Starting update for static message 'rideAlongRequest'");
        const GUILD_ID = homeGuildId();
        const CHANNEL_ID = tryGetChannelByName(client, ChannelName.REQUEST_10_12)?.id ?? "1176658796668522496";
        const DB_NAME = "rideAlongRequest";

        const roles = [
            {
                role: tryGetRoleByName(client, RoleName.WANTING_BCSO_RIDE_ALONGS),
                emoji: tryFindEmoji(client, "bcsoLogo")
            },
            {
                role: tryGetRoleByName(client, RoleName.OFFERING_WSU_RIDE_ALONGS),
                emoji: tryFindEmoji(client, "wsuLogo")
            },
            {
                role: tryGetRoleByName(client, RoleName.OFFERING_WLR_RIDE_ALONGS),
                emoji: tryFindEmoji(client, "wlrLogo")
            },
            {
                role: tryGetRoleByName(client, RoleName.OFFERING_TED_RIDE_ALONGS),
                emoji: tryFindEmoji(client, "tedLogo")
            },
            {
                role: tryGetRoleByName(client, RoleName.OFFERING_CID_RIDE_ALONGS),
                emoji: tryFindEmoji(client, "cidLogo")
            }
        ]

        const messageContent: BaseMessageOptions = {
            embeds: [ client.embeds.raRequests(client, roles) ],
            components: [ Constants.Request1012Buttons(client, roles) ]
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

        client.logger.log("Finished update for static message 'rideAlongRequest'");
    }
});
