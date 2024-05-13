import { format } from "node:util";
import { ApplicationCommandType, ContextMenuCommandBuilder, ModalSubmitInteraction } from "discord.js";
import { ContextCommand, ExtendedClient } from "@bot/core";
import { CategoryName, Constants, ModalHelper, RoleName } from "@bot/constants";

export default new ContextCommand({
    data: new ContextMenuCommandBuilder()
        .setName("Edit Message")
        .setType(ApplicationCommandType.Message)
        .setDMPermission(false),
    run: async ({ client, interaction }) => {
        const allowedRoles = [
            RoleName.DEV_DADDY,
            RoleName.CULT_LEADER
        ]

        // await interaction.deferReply({ ephemeral: true });

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
    
        // Fetch the target channel
        const targetChannel = await interaction.options.data[0].message?.channel.fetch();
        if (targetChannel === undefined || !targetChannel.isTextBased() || targetChannel.isDMBased()) { 
            await interaction.reply({
                ephemeral: true,
                embeds: [ client.embeds.error("Could not find target channel") ]
            });
            return;
        }
    
        // Fetch the target message
        const targetMessage = interaction.options.data[0].message;
        if (targetMessage === undefined) { 
            await interaction.reply({
                ephemeral: true,
                embeds: [ client.embeds.error("Could not find target message") ]
            });
            return;
        }

        // Check if the target message was sent by the bot
        if (targetMessage.author.id !== client.user?.id) {
            await interaction.reply({
                ephemeral: true,
                embeds: [ client.embeds.error("You can only edit messages sent by DepuTRON") ]
            });
            return;
        }

        // Check the user's permissions
        const allowedRolesName = allowedRoles.map(role => role.toString());
        if (member.roles.cache.filter(elem => allowedRolesName.includes(elem.name)).size === 0) {
            await interaction.followUp({
                ephemeral: true,
                embeds: [ client.embeds.error(format("You don't have the required permissions to edit this message. You require one of the following roles: \n%s", allowedRolesName.map(role => "- " + role).join("\n"))) ]
            });
            return;
        }

        client.registerModalCallback(format("adminEditMessage_%s", interaction.id), async (exClient: ExtendedClient, modalInteraction: ModalSubmitInteraction) => {
            const message = modalInteraction.fields.getTextInputValue("adminEditMessage_input");
            
            targetMessage.edit({ content: message });

            await modalInteraction.reply({
                ephemeral: true,
                embeds: [ client.embeds.success("Message successfully edited") ]
            });
        });

        await interaction.showModal(ModalHelper.EditMessageInput(format("adminEditMessage_%s", interaction.id)));
    }
});

