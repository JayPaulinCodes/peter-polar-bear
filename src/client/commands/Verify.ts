import { Guild, SlashCommandBuilder } from "discord.js";
import { Command, tryGetRoleByName } from "@bot/core";
import { DbLogic } from "@bot/database";
import { ErrorEmbed, RoleName, SuccessEmbed, WarningEmbed } from "@bot/constants";

export default new Command({
    data: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Attempt to solve your verification captcha")
        .setDMPermission(false)
        .addStringOption(option => option
            .setName("value")
            .setDescription("The values of the captcha")
            .setRequired(true)),
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

        // Check roles
        const blacklistedRoleNames = [ 
            RoleName.DEV_DADDY,
            RoleName.CULT_LEADER,
            RoleName.MEMBER
        ]
        const blacklistedRoles = blacklistedRoleNames.map(elem => elem.toString());
        
        // Check if the executor has the required permissions
        if (member.roles.cache.filter(elem => blacklistedRoles.includes(elem.name)).size > 0) {
            await interaction.followUp({
                ephemeral: true,
                embeds: [ new WarningEmbed("You are already verified!") ]
            });
            return;
        }

        // Check if the user already has a captcha in the DB
        let userCaptcha = await DbLogic.getCaptchaByUser(user);

        // Check if the existing captcha is expired
        if (userCaptcha !== null && userCaptcha.expires < new Date()) { 
            await DbLogic.deleteCaptchaById(userCaptcha.id); 
            userCaptcha = null;
        }

        // Check if we failed to find a captcha image
        if (userCaptcha === null) {
            await interaction.followUp({
                ephemeral: true,
                embeds: [ new ErrorEmbed("You don't have any active captcha to solve") ]
            });
            return;
        }

        // Verify the captcha
        const providedValue = interaction.options.get("value")?.value;
        if (providedValue === null || typeof providedValue !== "string" || providedValue !== userCaptcha.value) {
            await interaction.followUp({
                ephemeral: true,
                embeds: [ new WarningEmbed("Incorrect captcha value, please try again") ]
            });
            return;
        }

        // Fetch the member role
        const memberRole = tryGetRoleByName(client, RoleName.MEMBER);
        if (memberRole === undefined) {
            await interaction.followUp({
                ephemeral: true,
                embeds: [ new ErrorEmbed("Coulnd't find the role to give you!") ]
            });
            return;
        }

        await interaction.followUp({
            ephemeral: true,
            embeds: [ new SuccessEmbed("Captcha verification successful!") ]
        });
        member.roles.add(memberRole);
    }
});

