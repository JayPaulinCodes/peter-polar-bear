import { BaseInteraction, GuildMember, MessageFlags, ModalSubmitInteraction, TextChannel } from "discord.js";
import { format } from "node:util";
import { ChannelName, Constants, Filters, RoleName } from "@bot/constants";
import { Button, ExtendedClient, cardinalToOrdinal, ftoLog, generalLog, tryGetChannelByName, tryGetRoleByName } from "@bot/core";
import { DbLogic } from "@bot/database";

export default new Button({
    customIds: [
        format("raRequestRoleButton-%s", RoleName.WANTING_BCSO_RIDE_ALONGS.replace(/ /g, "_")),
        format("raRequestRoleButton-%s", RoleName.OFFERING_WSU_RIDE_ALONGS.replace(/ /g, "_")),
        format("raRequestRoleButton-%s", RoleName.OFFERING_WLR_RIDE_ALONGS.replace(/ /g, "_")),
        format("raRequestRoleButton-%s", RoleName.OFFERING_TED_RIDE_ALONGS.replace(/ /g, "_")),
        format("raRequestRoleButton-%s", RoleName.OFFERING_CID_RIDE_ALONGS.replace(/ /g, "_"))
    ],
    run: async ({ client, interaction }) => {
        const guild = interaction.guild;
        if (guild === null) return;
        const member = await guild.members.fetch(interaction.user.id);
        const roles = [
            {
                role: tryGetRoleByName(client, RoleName.WANTING_BCSO_RIDE_ALONGS),
                requiredRoles: [
                    tryGetRoleByName(client, RoleName.RESERVE_DEPUTY),
                    tryGetRoleByName(client, RoleName.DEPUTY),
                    tryGetRoleByName(client, RoleName.STAFF_IN_TRAINING),
                    tryGetRoleByName(client, RoleName.STAFF),
                    tryGetRoleByName(client, RoleName.SENIOR_STAFF),
                    tryGetRoleByName(client, RoleName.ADMINISTRATION),
                ].filter(Filters.notEmpty)
            },
            {
                role: tryGetRoleByName(client, RoleName.OFFERING_WSU_RIDE_ALONGS),
                requiredRoles: [ tryGetRoleByName(client, RoleName.WARRANT_SERVICES) ].filter(Filters.notEmpty)
            },
            {
                role: tryGetRoleByName(client, RoleName.OFFERING_WLR_RIDE_ALONGS),
                requiredRoles: [ tryGetRoleByName(client, RoleName.WILDLIFE_RANGERS) ].filter(Filters.notEmpty)
            },
            {
                role: tryGetRoleByName(client, RoleName.OFFERING_TED_RIDE_ALONGS),
                requiredRoles: [ tryGetRoleByName(client, RoleName.TRAFFIC_ENFORCEMENT) ].filter(Filters.notEmpty)
            },
            {
                role: tryGetRoleByName(client, RoleName.OFFERING_CID_RIDE_ALONGS),
                requiredRoles: [ tryGetRoleByName(client, RoleName.CRIMINAL_INVESTIGATIONS) ].filter(Filters.notEmpty)
            }
        ];

        // Defer the reply
        await interaction.deferReply({ ephemeral: true });

        // Get the role for the button
        const targetRole = tryGetRoleByName(client, interaction.customId.split("-")[1].replace(/_/g, " "));
        if (targetRole === undefined) {
            await interaction.followUp({
                ephemeral: true,
                embeds: [ client.embeds.error("Could not find the role to toggle!") ]
            });
            return;
        }

        // Determine if we are adding or removing
        const doesMemberHaveRole = member.roles.cache.has(targetRole.id);

        // Get and check the required roles
        const requiredRoles = roles.find(elem => elem.role?.id === targetRole.id)?.requiredRoles ?? [];
        if (!doesMemberHaveRole && !member.roles.cache.hasAny(...requiredRoles.map(elem => elem.id))) {
            await interaction.followUp({
                ephemeral: true,
                embeds: [ client.embeds.warnning(format("You do not have the required permissions to add the role %s!", targetRole.toString())) ]
            });
            return;
        }

        // Complete the action and log it
        if (doesMemberHaveRole) {
            await member.roles.remove(targetRole);

            await generalLog(client, format(
                "%s (%s) removed the '%s' (%s) role from themself",
                member.nickname ?? member.displayName,
                member.id,
                targetRole.name,
                targetRole.id));

            await interaction.followUp({
                ephemeral: true,
                embeds: [ client.embeds.roleUpdates([], [ targetRole ]) ]
            });
        } else {
            await member.roles.add(targetRole);
            
            await generalLog(client, format(
                "%s (%s) gave themself the '%s' (%s) role",
                member.nickname ?? member.displayName,
                member.id,
                targetRole.name,
                targetRole.id));

            await interaction.followUp({
                ephemeral: true,
                embeds: [ client.embeds.roleUpdates([ targetRole ], []) ]
            });
        }
    }
});