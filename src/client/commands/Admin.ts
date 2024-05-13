import { ChannelType, Message, ModalSubmitInteraction, SlashCommandBuilder } from "discord.js";
import { format } from "node:util";
import { Command, ExtendedClient, cardinalToOrdinal, ftoLog, generalLog, splitMessage, tryGetChannelByName, tryGetRoleByName } from "@bot/core";
import { CategoryName, ChannelName, Constants, RoleName } from "@bot/constants";
import { DbLogic } from "@bot/database";

export default new Command({
    data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Administrative commands for DepuTRON")
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
    .addSubcommandGroup(group => group
        .setName("fto")
        .setDescription("FTO related admin commands")
        .addSubcommand(command => command
            .setName("raqueuepos")
            .setDescription("Manually set someone's position in the ride along queue")
            .addUserOption(option => option
                .setName("target")
                .setDescription("The user to add to the ride along queue")
                .setRequired(true)
            )
            .addNumberOption(option => option
                .setName("position")
                .setDescription("The position to set the target into")
                .setMinValue(1)
                .setRequired(true)
            )
            .addNumberOption(option => option
                .setName("ridealong")
                .setDescription("The ride along number")
                .setMinValue(1)
                .setMaxValue(4)
                .setRequired(true)
            )
        )
        .addSubcommand(command => command
            .setName("queueremove")
            .setDescription("Remove someone from the ride along queue")
            .addUserOption(option => option
                .setName("target")
                .setDescription("The user to remove from the ride along queue")
                .setRequired(true)
            )
        )
        .addSubcommand(command => command
            .setName("clearqueue")
            .setDescription("Clears the FTO ride along queue")
        )
    ),
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
                    embeds: [ client.embeds.error("Cannot process command") ]
                });
            } else {
                await interaction.reply({
                    ephemeral: true,
                    embeds: [ client.embeds.error("Cannot process command") ]
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
                    embeds: [ client.embeds.error("Could not find the channel to send the message to") ]
                });
                return;
            }
            
            const channel = await interaction.guild?.channels.fetch(_channel.id);
            if (channel === null || channel === undefined || !channel.isTextBased()) {
                await interaction.reply({
                    ephemeral: true,
                    embeds: [ client.embeds.error("Could not find the channel to send the message to") ]
                });
                return;
            }

            // Check permissions
            const allowedRoleNames = [ RoleName.ADMINISTRATION, RoleName.SENIOR_STAFF, RoleName.DEPUTRON_TEAM ]
            switch (channel.parent?.name) {
                case CategoryName.WSU: allowedRoleNames.push(RoleName.WSU_COORDINATOR, RoleName.WSU_SUPERVISOR); break;
                case CategoryName.CID: allowedRoleNames.push(RoleName.CID_COORDINAOR, RoleName.CID_SUPERVISOR); break;
                case CategoryName.TED: allowedRoleNames.push(RoleName.TED_COORDINATOR, RoleName.TED_SUPERVISOR); break;
                case CategoryName.WLR: allowedRoleNames.push(RoleName.WLR_COORDINATOR, RoleName.WLR_SUPERVISOR); break;
                case CategoryName.K9: allowedRoleNames.push(RoleName.K9_COORDINATOR, RoleName.K9_SUPERVISOR); break;
            }
            const allowedRoles = allowedRoleNames.map(elem => elem.toString());

            if (user.roles.cache.filter(elem => allowedRoles.includes(elem.name)).size === 0) {
                await interaction.reply({
                    ephemeral: true,
                    embeds: [ client.embeds.warnning("You do not have the required permissions to send a message to the specified channel") ]
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
                    embeds: [ client.embeds.success("Message successfully sent") ]
                });
            });

            await interaction.showModal(Constants.AdminMessageInput(format("adminMessage_%s", interaction.id)));
        }

        const handleFtoRaQueuePos = async () => {
            await interaction.deferReply({ ephemeral: true });

            // Check for needed role
            const allowedRoleNames = [ 
                RoleName.ADMINISTRATION, 
                RoleName.SENIOR_STAFF, 
                RoleName.STAFF,
                RoleName.FTO_COMMAND,
                RoleName.FTO_LEAD,
                RoleName.DEPUTRON_TEAM
            ]
            const allowedRoles = allowedRoleNames.map(elem => elem.toString());

            if (user.roles.cache.filter(elem => allowedRoles.includes(elem.name)).size === 0) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.warnning("You do not have the required permissions to do this!") ]
                });
                return;
            }

            // Fetch the target
            if (interaction.options.data[0].options === undefined) return;
            const _target = <string> interaction.options.get("target", true).value;
            if (_target === undefined || typeof _target !== "string") {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.error("Could not find the specified target.") ]
                });
                return;
            }

            const target = await guild.members.fetch(_target);
            if (target === undefined) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.error("Could not find the specified target.") ]
                });
                return;
            }

            // Check if the target is a deputy in training
            const ditRole = tryGetRoleByName(client, RoleName.DEPUTY_IN_TRAINING);
            if (ditRole === undefined) throw new Error(format("Missing Role Error: Could not find the role with name '%s'", RoleName.DEPUTY_IN_TRAINING));
            if (!target.roles.cache.has(ditRole.id)) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.warnning("The target user must have the Deputy In Training role to be added to the ride along queue!") ]
                });
                return;
            }

            // Fetch and ground the provided position & ra number
            const originalRideAlongQueue = await DbLogic.getAllFtoRideAlongs();
            const rawPosition = <number> interaction.options.get("position", true).value;
            const position = rawPosition > originalRideAlongQueue.length + 1 ? originalRideAlongQueue.length + 1 : rawPosition;
            const raNum = <number> interaction.options.get("ridealong", true).value;

            // Check if the target is in the queue already, and if they are verify we are moving their position
            const targetRa = originalRideAlongQueue.find(elem => elem.id === target.id);
            if (targetRa !== undefined && targetRa.queuePos === position) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.warnning(format(
                        "%s (%s) is already in the ride along queue in position #%s",
                        target.nickname ?? target.displayName,
                        target.id,
                        position
                    )) ]
                });
                return;
            }

            // Update the queue
            if (targetRa !== undefined) {
                await DbLogic.deleteFtoRideAlongById(targetRa.id);
            }

            const modifiedRideAlongs = await Promise.all(originalRideAlongQueue
                .filter(elem => elem.queuePos >= position && elem.id !== target.id)
                .map(elem => DbLogic.updateFtoRideAlong({ ...elem, queuePos: elem.queuePos + 1 })));
            
            const newTargetRa = await DbLogic.createFtoRideAlong(target.id, target.nickname ?? target.displayName, raNum, position);

            // Update the embed
            await client.staticMessages.get("ftoRideAlongQueue")?.update(client);

            // Get the trainee ftochannel
            const traineeChannel = tryGetChannelByName(client, ChannelName.TRAINEE_FTO_CHAT);
            if (traineeChannel === undefined || !traineeChannel.isTextBased()) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.error("Could not find the ride along request channel") ]
                });
                return;
            }

            // Ping the target & effected people
            traineeChannel.send({
                content: format(
                    "%s (%s) was set into position #%s in the ride along queue by CoC.%s",
                    target.toString(),
                    target.nickname ?? target.displayName,
                    position,
                    modifiedRideAlongs.length === 0 
                        ? ""
                        : "\nThe following people had their queue position adjusted:\n" 
                            + modifiedRideAlongs.map(elem => format(
                            "<@%s> (%s) was moved from #%s to #%s",
                            elem?.id,
                            elem?.username,
                            originalRideAlongQueue.find(entry => entry.id === elem?.id)?.queuePos,
                            elem?.queuePos
                        )).join("\n"))
            });

            // Log to FTO logs
            await ftoLog(client, format(
                "%s (%s) has set the ride along queue position for %s (%s) to `#%s` for their `%s` ride along.", 
                user.nickname ?? user.user.username, 
                user.id,
                target.nickname ?? target.user.username, 
                target.id,
                position,
                cardinalToOrdinal(raNum)));
                
            // Send follow up
            await interaction.followUp({
                embeds: [ client.embeds.success(format(
                    "Successfully added %s (%s) to the ride along queue",
                    target.nickname ?? target.displayName,
                    target.id
                )) ]
            });
        }

        const handleFtoClearQueue = async () => {
            await interaction.deferReply({ ephemeral: true });

            // Check for needed role
            const allowedRoleNames = [ 
                RoleName.ADMINISTRATION, 
                RoleName.SENIOR_STAFF, 
                RoleName.STAFF,
                RoleName.FTO_COMMAND,
                RoleName.FTO_LEAD,
                RoleName.DEPUTRON_TEAM
            ]
            const allowedRoles = allowedRoleNames.map(elem => elem.toString());

            if (user.roles.cache.filter(elem => allowedRoles.includes(elem.name)).size === 0) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.warnning("You do not have the required permissions to do this!") ]
                });
                return;
            }

            // Check if the queue is empty
            const origQueue = await DbLogic.getAllFtoRideAlongs();
            if (origQueue.length === 0) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.warnning("There is currently no one in the ride along queue!") ]
                });
                return;
            }

            // Get the trainee fto channel
            const traineeChannel = tryGetChannelByName(client, ChannelName.TRAINEE_FTO_CHAT);
            if (traineeChannel === undefined || !traineeChannel.isTextBased()) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.error("Could not find the trainee fto channel") ]
                });
                return;
            }

            // Ping all of the queue members in the trainee chat notifying them of the clear
            const queueMembers = await Promise.all(origQueue.map(elem => guild.members.fetch(elem.id)));
            await traineeChannel.send({
                content: format("The FTO ride along queue has been cleared by CoC.\nThe following people were removed from the queue:\n%s",
                    queueMembers.map(elem => elem.toString()).join(", "))
            });

            // Nuke the queue
            await DbLogic.deleteAllFtoRideAlong();

            // Update the embed
            await client.staticMessages.get("ftoRideAlongQueue")?.update(client);

            // Log to FTO logs
            await ftoLog(client, format(
                "%s (%s) has cleared the ride along queue.", 
                user.nickname ?? user.user.username, 
                user.id));
                
            // Send follow up
            await interaction.followUp({
                embeds: [ client.embeds.success("Successfully cleared the ride along queue") ]
            });
        }

        const handleFtoRaQueueRemove = async () => {
            await interaction.deferReply({ ephemeral: true });

            // Check for needed role
            const allowedRoleNames = [ 
                RoleName.ADMINISTRATION, 
                RoleName.SENIOR_STAFF, 
                RoleName.STAFF,
                RoleName.FTO_COMMAND,
                RoleName.FTO_LEAD,
                RoleName.DEPUTRON_TEAM
            ]
            const allowedRoles = allowedRoleNames.map(elem => elem.toString());

            if (user.roles.cache.filter(elem => allowedRoles.includes(elem.name)).size === 0) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.warnning("You do not have the required permissions to do this!") ]
                });
                return;
            }

            // Fetch the target
            if (interaction.options.data[0].options === undefined) return;
            const _target = <string> interaction.options.get("target", true).value;
            if (_target === undefined || typeof _target !== "string") {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.error("Could not find the specified target.") ]
                });
                return;
            }

            const target = await guild.members.fetch(_target);
            if (target === undefined) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.error("Could not find the specified target.") ]
                });
                return;
            }

            // Fetch and ground the provided position & ra number
            const originalRideAlongQueue = await DbLogic.getAllFtoRideAlongs();
            const rawPosition = <number> interaction.options.get("position", true).value;
            const position = rawPosition > originalRideAlongQueue.length + 1 ? originalRideAlongQueue.length + 1 : rawPosition;

            // Check if the target is in the queue
            const targetRa = originalRideAlongQueue.find(elem => elem.id === target.id);
            if (targetRa === undefined) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.warnning(format(
                        "%s (%s) is not in the ride along queue",
                        target.nickname ?? target.displayName,
                        target.id
                    )) ]
                });
                return;
            }

            // Update the queue
            await DbLogic.deleteFtoRideAlongById(targetRa.id);
            const newRideAlongQueue = await DbLogic.getAllFtoRideAlongs();  
            newRideAlongQueue.sort((a, b) => a.queuePos - b.queuePos);  
            for (let i = 0; i < newRideAlongQueue.length; i++) {
                const elem = newRideAlongQueue[i];
                await DbLogic.updateFtoRideAlong({
                    ...elem,
                    queuePos: i + 1
                });
            }

            // Update the embed
            await client.staticMessages.get("ftoRideAlongQueue")?.update(client);

            // Get the trainee ftochannel
            const traineeChannel = tryGetChannelByName(client, ChannelName.TRAINEE_FTO_CHAT);
            if (traineeChannel === undefined || !traineeChannel.isTextBased()) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.error("Could not find the trainee fto channel") ]
                });
                return;
            }

            // Ping the target
            traineeChannel.send({
                content: format(
                    "%s (%s) you were removed from the ride along queue by CoC.",
                    target.toString(),
                    target.nickname ?? target.displayName)
            });

            // Log to FTO logs
            await ftoLog(client, format(
                "%s (%s) has removed %s (%s) from the ride along queue, they were in position `#%s` waiting for their `%s` ride along", 
                user.nickname ?? user.user.username, 
                user.id,
                target.nickname ?? target.user.username, 
                target.id,
                position,
                cardinalToOrdinal(targetRa.rideAlongNum)));
                
            // Send follow up
            await interaction.followUp({
                embeds: [ client.embeds.success(format(
                    "Successfully removed %s (%s) from the ride along queue",
                    target.nickname ?? target.displayName,
                    target.id
                )) ]
            });
        }

        switch (subCommand) {
            default: await cantProcessCommand(); break;
            case "message": await handleMessage(); break;
            case "fto":
                if (interaction.options.data[0].options === undefined) return;
                const subSubCommand = interaction.options.data[0].options[0].name;
                switch (subSubCommand) {
                    case "raqueuepos": await handleFtoRaQueuePos(); break;
                    case "clearqueue": await handleFtoClearQueue(); break;
                }
                break;
        }

    }
});

