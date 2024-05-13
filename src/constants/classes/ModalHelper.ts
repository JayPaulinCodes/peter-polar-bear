import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export class ModalHelper {
    public static AdminMessageInput(id: string): ModalBuilder {
        return new ModalBuilder()
            .setCustomId(id)
            .setTitle("Message Content")
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId("adminMessage_input")
                            .setMinLength(1)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph)
                            .setLabel("Enter the content of the message to send")
                    )
            )
    }

    public static EditMessageInput(id: string): ModalBuilder {
        return new ModalBuilder()
            .setCustomId(id)
            .setTitle("Edit Message")
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId("adminEditMessage_input")
                            .setMinLength(1)
                            .setMaxLength(2000)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph)
                            .setLabel("Enter the content of the message to update")
                    )
            )
    }
}