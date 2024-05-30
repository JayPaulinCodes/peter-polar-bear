import { ChannelName, Constants, ErrorEmbed, RoleName, RolesUpdatedEmbed, WarningEmbed } from "@bot/constants";
import { Button, ExtendedClient, generalLog, tryFindEmoji, tryGetChannelByName, tryGetRoleByName } from "@bot/core";
import { DbLogic } from "@bot/database";
import { Role } from "discord.js";
import { format } from "node:util";

export default new Button({
    customIds: [
        "roleShopMessage_developmentUpdates",
        "roleShopMessage_contentUpdates",
    ],
    run: async ({ client, interaction }) => {
        await interaction.deferReply({ ephemeral: true });

        // Fetch the user who ran the action
        const user = await interaction.user.fetch();
        const member = await interaction.guild?.members.fetch(user.id);
        if (member === undefined) { 
            await interaction.reply({
                ephemeral: true,
                embeds: [ new ErrorEmbed("Could not find guild member") ]
            });
            return;
        }

        // Find the role
        let role: Role | undefined;
        switch (interaction.customId) {
            case "roleShopMessage_developmentUpdates": role = tryGetRoleByName(client, RoleName.DEV_UPDATES); break;
            case "roleShopMessage_contentUpdates": role = tryGetRoleByName(client, RoleName.CONTENT_UPDATES); break;
            default: role = undefined; break;
        }
        if (role === undefined) { 
            await interaction.reply({
                ephemeral: true,
                embeds: [ new ErrorEmbed("Could not find role") ]
            });
            return;
        }

        if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);

            await interaction.followUp({
                ephemeral: true,
                embeds: [ new RolesUpdatedEmbed([], [ role ]) ]
            });
        } else {
            await member.roles.add(role);

            await interaction.followUp({
                ephemeral: true,
                embeds: [ new RolesUpdatedEmbed([ role ], []) ]
            });
        }
    }
});