import { ChannelName, Constants, ErrorEmbed, RoleName, WarningEmbed } from "@bot/constants";
import { Button, ExtendedClient, generalLog, tryFindEmoji, tryGetChannelByName } from "@bot/core";
import { DbLogic } from "@bot/database";
import Captcha from "@packages/captcha";
import { ModalSubmitInteraction } from "discord.js";
import { format } from "node:util";

export default new Button({
    customIds: "captchaMessage_showCaptcha",
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

        // Try to create a new captcha
        if (userCaptcha === null) {
            const newCaptchaImage = new Captcha();
            userCaptcha = await DbLogic.createCaptcha(user.id, newCaptchaImage.buffer, newCaptchaImage.dataURL, newCaptchaImage.value, new Date(Date.now() + 600000));
        }

        // Check if we failed to make a new captcha image
        if (userCaptcha === null) {
            await interaction.followUp({
                ephemeral: true,
                embeds: [ new ErrorEmbed("Failed to generate a captcha image") ]
            });
            return;
        }

        const expiresUnix = Math.floor(userCaptcha.expires.getTime() / 1000);
        await interaction.followUp({
            ephemeral: true,
            content: format("Here is your CAPTCHA, it will expire in <t:%s:R> on <t:%s:f>", expiresUnix, expiresUnix),
            files: [ userCaptcha.image ]
        });
    }
});