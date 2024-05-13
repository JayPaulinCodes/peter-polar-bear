import { ChannelName, Constants, RoleName } from "@bot/constants";
import { Button, ExtendedClient, generalLog, tryFindEmoji, tryGetChannelByName } from "@bot/core";
import { ModalSubmitInteraction } from "discord.js";
import { format } from "node:util";

export default new Button({
    customIds: "loaReturningExtending_staffAcknowledged",
    run: async ({ client, interaction }) => {
        // Fetch the user who ran the action
        const user = await interaction.user.fetch();
        const member = await interaction.guild?.members.fetch(user.id);
        if (member === undefined) { 
            await interaction.reply({
                ephemeral: true,
                embeds: [ client.embeds.error("Could not find guild member") ]
            });
            return;
        }

        // Check roles
        const allowedRoleNames = [ 
            RoleName.ADMINISTRATION,
            RoleName.SENIOR_STAFF,
            RoleName.STAFF
        ]
        const allowedRoles = allowedRoleNames.map(elem => elem.toString());

        // Check if the executor has the required permissions
        if (member.roles.cache.filter(elem => allowedRoles.includes(elem.name)).size === 0) {
            await interaction.followUp({
                ephemeral: true,
                embeds: [ client.embeds.warnning("You do not have the required permissions to do that") ]
            });
            return;
        }

        // Delete message
        await interaction.message.delete();

        // Log to general logs
        await generalLog(client, format(
            "%s (%s) acknowledged a LOA action",
            member.nickname ?? member.displayName,
            member.id
        ));

        // Follow up
        await interaction.reply({
            ephemeral: true,
            embeds: [ client.embeds.success("Successfully acknowledge LOA") ]
        });
    }
});