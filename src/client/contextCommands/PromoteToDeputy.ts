import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { format } from "node:util";
import { ContextCommand, ftoLog, tryGetChannelByName, tryGetRoleByName } from "@bot/core";
import { ChannelName, RoleName } from "@bot/constants";

export default new ContextCommand({
    data: new ContextMenuCommandBuilder()
        .setName("Promote to Deputy")
        .setType(ApplicationCommandType.User)
        .setDMPermission(false),
    run: async ({ client, interaction }) => {
        const allowedRoles = [
            RoleName.FTO_FTA,
            RoleName.FTO_E,
            RoleName.FTO_LEAD,
            RoleName.FTO_COMMAND
        ]

        await interaction.deferReply({ ephemeral: true });

        // Fetch the guild
        const guild = interaction.guild;
        if (guild === null) { 
            await interaction.reply({
                ephemeral: true,
                embeds: [ client.embeds.error("Could not find guild") ]
            });
            return;
        }
    
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
    
        // Fetch the target user
        const target = await guild.members.fetch(interaction.targetId);
        if (target === undefined) { 
            await interaction.reply({
                ephemeral: true,
                embeds: [ client.embeds.error("Could not find target") ]
            });
            return;
        }

        // Make sure the member has the fta/fto role or a fto coc role
        const hasFtoRole = member.roles.cache.find(role => (<string[]>allowedRoles).includes(role.name)) !== undefined;
        if (!hasFtoRole) {
            await interaction.reply({
                ephemeral: true,
                embeds: [ client.embeds.error("You do not have the required tags to perform this action.\nIf you believe this is a mistake please reach out to your CoC.") ]
            });
            return;
        }

        // Fetch the deputy and dit role
        const deputyRole = tryGetRoleByName(client, RoleName.DEPUTY);
        const deputyInTrainingRole = tryGetRoleByName(client, RoleName.DEPUTY_IN_TRAINING);
        if (deputyRole === undefined || deputyInTrainingRole === undefined) {
            await interaction.reply({
                ephemeral: true,
                embeds: [ client.embeds.error("Could not fetch the required roles to perform this action") ]
            });
            return;
        }

        // Check if they already have the deputy role
        if (target.roles.cache.has(deputyRole.id)) {
            await interaction.reply({
                ephemeral: true,
                embeds: [ client.embeds.error("This member is already a deputy") ]
            });
            return;
        }

        // Check if they have the dit role
        if (!target.roles.cache.has(deputyInTrainingRole.id)) {
            await interaction.reply({
                ephemeral: true,
                embeds: [ client.embeds.error("This member is not a deputy in training") ]
            });
            return;
        }

        // Update the roles
        await target.roles.remove(deputyInTrainingRole);
        await target.roles.add(deputyRole);

        // Fetch the cabin chat
        const theCabin = tryGetChannelByName(client, ChannelName.CABIN);
        if (theCabin === undefined || !theCabin.isTextBased()) {
            await interaction.reply({
                ephemeral: true,
                embeds: [ client.embeds.warnning(`Could not find a the chat named \`${ChannelName.CABIN}\``) ]
            });
        }

        // Send message to the cabin
        if (theCabin !== undefined && theCabin.isTextBased()) {
            await theCabin.send({
                content: format("Congratulations to %s on successfully completing the FTO Trainee Ride Along Stage! Go get out there on your own and fight crime! :oncoming_police_car:", target.toString())
            });
        }

        // Log to the fto log channel
        await ftoLog(client, `${member.nickname ?? member.displayName} (${member.id}) has promoted ${target.nickname ?? target.displayName} (${target.id}) to deputy`);
        
        // Follow up
        await interaction.editReply("User successfully promoted to deputy!")
    }
});

