import { ChannelType, Message, ModalSubmitInteraction, SlashCommandBuilder } from "discord.js";
import { format } from "node:util";
import { Command, ExtendedClient, generalLog, splitMessage } from "@bot/core";
import { ErrorEmbed, ModalHelper, RoleName, SuccessEmbed, WarningEmbed } from "@bot/constants";

export default new Command({
    data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Administrative commands for Peter Polar Bear")
    .setDMPermission(false)
    .addSubcommand(command => command
        .setName("message")
        .setDescription("Sends a message to the current or specified channel")
        .addChannelOption(option => option
            .setName("target")
            .setDescription("The channel to send the message to")
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildText)    
        )
    )
    // .addSubcommandGroup(group => group
    //     .setName("fto")
    //     .setDescription("FTO related admin commands")
    //     .addSubcommand(command => command
    //         .setName("raqueuepos")
    //         .setDescription("Manually set someone's position in the ride along queue")
    //         .addUserOption(option => option
    //             .setName("target")
    //             .setDescription("The user to add to the ride along queue")
    //             .setRequired(true)
    //         )
    //         .addNumberOption(option => option
    //             .setName("position")
    //             .setDescription("The position to set the target into")
    //             .setMinValue(1)
    //             .setRequired(true)
    //         )
    //         .addNumberOption(option => option
    //             .setName("ridealong")
    //             .setDescription("The ride along number")
    //             .setMinValue(1)
    //             .setMaxValue(4)
    //             .setRequired(true)
    //         )
    //     )
    //     .addSubcommand(command => command
    //         .setName("queueremove")
    //         .setDescription("Remove someone from the ride along queue")
    //         .addUserOption(option => option
    //             .setName("target")
    //             .setDescription("The user to remove from the ride along queue")
    //             .setRequired(true)
    //         )
    //     )
    //     .addSubcommand(command => command
    //         .setName("clearqueue")
    //         .setDescription("Clears the FTO ride along queue")
    //     )
    /** )*/,
    run: async ({ client, interaction }) => {
        if (interaction.options.data[0].options === undefined) return;
        if (interaction.guild === null) return;
        const subCommand = interaction.options.data[0].name;
        const guild = interaction.guild;
        const user = await guild.members.fetch(interaction.user.id);

        const cantProcessCommand = async () => {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ new ErrorEmbed("Cannot process command") ]
                });
            } else {
                await interaction.reply({
                    ephemeral: true,
                    embeds: [ new ErrorEmbed("Cannot process command") ]
                });
            }
            return;
        }

        const handleMessage = async () => {
            // Find the channel to send the message to
            const _channel = interaction.options.data[0].options !== undefined && interaction.options.data[0].options.length > 0
                ? interaction.options.data[0].options[0].channel
                : interaction.channel;
            if (_channel?.type !== ChannelType.GuildText) {
                await interaction.reply({
                    ephemeral: true,
                    embeds: [ new ErrorEmbed("Could not find the channel to send the message to") ]
                });
                return;
            }
            
            const channel = await interaction.guild?.channels.fetch(_channel.id);
            if (channel === null || channel === undefined || !channel.isTextBased()) {
                await interaction.reply({
                    ephemeral: true,
                    embeds: [ new ErrorEmbed("Could not find the channel to send the message to") ]
                });
                return;
            }

            // Check permissions
            const allowedRoleNames = [ RoleName.DEV_DADDY, RoleName.CULT_LEADER];
            const allowedRoles = allowedRoleNames.map(elem => elem.toString());

            if (user.roles.cache.filter(elem => allowedRoles.includes(elem.name)).size === 0) {
                await interaction.reply({
                    ephemeral: true,
                    embeds: [ new WarningEmbed("You do not have the required permissions to send a message to the specified channel") ]
                });
                return;
            }

            client.registerModalCallback(format("adminMessage_%s", interaction.id), async (exClient: ExtendedClient, modalInteraction: ModalSubmitInteraction) => {
                const message = modalInteraction.fields.getTextInputValue("adminMessage_input");
                const messageSplit = splitMessage(message);
                const sentMessages: Message[] = await Promise.all(messageSplit.map(elem => channel.send({ content: elem })));

                generalLog(client, format(
                    "%s (%s) used DepuTRON to send a message to channel %s (%s)\n%s",
                    user.nickname ?? user.user.username,
                    user.id,
                    channel.toString(),
                    channel.id,
                    sentMessages.map(elem => `- ${elem.url}`).join("\n")
                ));

                await modalInteraction.reply({
                    ephemeral: true,
                    embeds: [ new SuccessEmbed("Message successfully sent") ]
                });
            });

            await interaction.showModal(ModalHelper.AdminMessageInput(format("adminMessage_%s", interaction.id)));
        }

        switch (subCommand) {
            default: await cantProcessCommand(); break;
            case "message": await handleMessage(); break;
            // case "fto":
            //     if (interaction.options.data[0].options === undefined) return;
            //     const subSubCommand = interaction.options.data[0].options[0].name;
            //     switch (subSubCommand) {
            //         case "raqueuepos": await handleFtoRaQueuePos(); break;
            //         case "clearqueue": await handleFtoClearQueue(); break;
            //     }
            //     break;
        }

    }
});

