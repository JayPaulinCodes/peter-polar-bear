import { ActionRowBuilder, ActionRowComponent, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export class ComponentHelper {
    public static captchaButton(): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("captchaMessage_showCaptcha")
                .setLabel("Show Captcha Image")
                .setStyle(ButtonStyle.Primary)
        )
    }
}