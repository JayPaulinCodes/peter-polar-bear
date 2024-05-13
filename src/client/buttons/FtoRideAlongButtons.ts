import { BaseInteraction, GuildMember, MessageFlags, ModalSubmitInteraction, TextChannel } from "discord.js";
import { format } from "node:util";
import { ChannelName, Constants, RoleName } from "@bot/constants";
import { Button, ExtendedClient, cardinalToOrdinal, ftoLog, tryGetChannelByName } from "@bot/core";
import { DbLogic } from "@bot/database";

export default new Button({
    customIds: [
        "ride-along-action-fta",
        "ride-along-action-fto",
        "ride-along-action-join-queue",
        "ride-along-action-leave-queue"
    ],
    run: async ({ client, interaction }) => {
        // Make sure the channel exists
        if (interaction.channel === null) { 
            await interaction.reply({
                ephemeral: true,
                embeds: [ client.embeds.error("Could not find interaction's channel") ]
            });
            return;
        }

        // Fetch the channel
        const channel = <TextChannel>await interaction.channel.fetch();
        
        // Fetch the guild
        const guild = channel.guild;

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

        // Get the current ride along queue
        const rideAlongQueue = await DbLogic.getAllFtoRideAlongs();
        rideAlongQueue.sort((a, b) => a.queuePos - b.queuePos);

        const handleFtaFto = async () => {
            await interaction.deferReply({ ephemeral: true });
            const allowedRoleNames = [
                RoleName.FTO_FTA,
                RoleName.FTO_E,
                RoleName.FTO_LEAD,
                RoleName.FTO_COMMAND
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

            // Check if the ride along queue is empty
            if (rideAlongQueue.length === 0) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.warnning("There are no ride alongs in the queue") ]
                });
                return;
            }

            // Check if we are processing a fta or fto ride along
            const isFta = interaction.customId === "ride-along-action-fta";
            
            // If we are processing a fta ride along, make sure there is one avail
            if (isFta && rideAlongQueue.filter(elem => elem.rideAlongNum !== 4).length === 0) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.warnning("There are no FTA ride alongs in the queue") ]
                });
                return;
            }

            // Get the next in queue
            const filtredRideAlongQueue = isFta ? rideAlongQueue.filter(elem => elem.rideAlongNum !== 4) : rideAlongQueue;
            filtredRideAlongQueue.sort((a, b) => a.queuePos - b.queuePos);
            const nextRideAlong = filtredRideAlongQueue[0];

            // Remove from the DB
            await DbLogic.deleteFtoRideAlongById(nextRideAlong.id);

            // Fix the queue order
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

            // Log to fto channel
            const deputyInTraining = await guild.members.fetch(nextRideAlong.id);
            await ftoLog(client, format(
                "%s (%s) has accepted a FT%s ride along for %s (%s) who was in queue position `#%s` waiting for their `%s` ride along.", 
                member.nickname ?? member.user.username, 
                member.id,
                isFta ? "A" : "O",
                deputyInTraining.nickname ?? deputyInTraining.user.username, 
                deputyInTraining.id,
                nextRideAlong.queuePos,
                cardinalToOrdinal(nextRideAlong.rideAlongNum)));
                
            await interaction.followUp({
                ephemeral: true,
                embeds: [ client.embeds.success("Successfully accepted ride along") ]
            });

            // Accept the ride along, send the embed for pending confirmation
            const rideAlongRequestChannel = tryGetChannelByName(client, ChannelName.RIDE_ALONG_REQUEST);
            if (rideAlongRequestChannel === undefined || !rideAlongRequestChannel.isTextBased()) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.error("Could not find the ride along request channel") ]
                });
                return;
            }
            
            const rideAlongChannelMessage = await rideAlongRequestChannel.send({
                content: deputyInTraining.toString(),
                embeds: [ client.embeds.rideAlongAccepted(deputyInTraining, member) ],
                components: [ Constants.RideAlongAcceptanceButtons ]
            });

            // Attempt to DM the DIT notifying of the ride along acceptance
            if (!deputyInTraining.isCommunicationDisabled()) {
                deputyInTraining.send({
                    content: format(
                        "Your ride along request has been accepted, please reference [this](%s) message for more information.",
                        rideAlongChannelMessage.url)
                });
            }


            const acceptanceFilter = (_interaction: BaseInteraction) => _interaction.user.id === member.user.id;
            try {
                const confirmation = await rideAlongChannelMessage.awaitMessageComponent({ filter: acceptanceFilter, time: 300_000 });
            
                if (confirmation.customId === "rideAlongAcceptance_confirm") {
                    // Mark the ride along as confirmed and delete the message
                    await rideAlongChannelMessage.delete();

                    // Log to the FTO channel
                    await ftoLog(client, format(
                        "%s (%s) has comfirmed the ride along for %s (%s).", 
                        member.nickname ?? member.user.username, 
                        member.id,
                        deputyInTraining.nickname ?? deputyInTraining.user.username, 
                        deputyInTraining.id));
                } else if (confirmation.customId === "rideAlongAcceptance_cancel") {
                    // Mark the ride along as canceled and delete the message
                    await rideAlongChannelMessage.delete();

                    // Log to the FTO channel
                    await ftoLog(client, format(
                        "%s (%s) has canceled the ride along for %s (%s).", 
                        member.nickname ?? member.user.username, 
                        member.id,
                        deputyInTraining.nickname ?? deputyInTraining.user.username, 
                        deputyInTraining.id));
                }
            } catch (err) {
                // Check if the DIT is in the voice chat, and if so assume it was confirmed
                if (deputyInTraining.voice.channelId === member.voice.channelId) {
                    // Mark the ride along as confirmed and delete the message
                    await rideAlongChannelMessage.delete();

                    // Log to the FTO channel
                    await ftoLog(client, format(
                        "%s (%s) has comfirmed the ride along for %s (%s).", 
                        member.nickname ?? member.user.username, 
                        member.id,
                        deputyInTraining.nickname ?? deputyInTraining.user.username, 
                        deputyInTraining.id));
                    return;
                }

                // If the DIT isn't in the voice chat, give the FTO another ping and a final 5 minutes
                if (member.voice.channelId !== null) {
                    const ftaFtoChannel = tryGetChannelByName(client, ChannelName.FTO_FTA_CHAT);
                    if (ftaFtoChannel === undefined || !ftaFtoChannel.isTextBased()) return;

                    await ftaFtoChannel.send({
                        flags: [ MessageFlags.SuppressEmbeds ],
                        content: format(
                            "%s, it has been 5 minutes since you approved a [ride along](%s), automatically canceling the ride along.",
                            member.toString(),
                            rideAlongChannelMessage.url)
                    });

                    await rideAlongChannelMessage.delete();

                    // Log to the FTO channel
                    await ftoLog(client, format(
                        "%s (%s) has canceld the ride along for %s (%s).", 
                        member.nickname ?? member.user.username, 
                        member.id,
                        deputyInTraining.nickname ?? deputyInTraining.user.username, 
                        deputyInTraining.id));
                    return;
                }
            }
        }

        const handleJoin = async () => {
            const allowedRoleNames = [ RoleName.DEPUTY_IN_TRAINING ]
            const allowedRoles = allowedRoleNames.map(elem => elem.toString());

            // Check if the executor has the required permissions
            if (member.roles.cache.filter(elem => allowedRoles.includes(elem.name)).size === 0) {
                await interaction.reply({
                    ephemeral: true,
                    embeds: [ client.embeds.warnning("You do not have the required permissions to do that") ]
                });
                return;
            }

            // Make sure the executor isn't in the queue
            if (rideAlongQueue.find(elem => elem.id === member.id) !== undefined) {
                await interaction.reply({
                    ephemeral: true,
                    embeds: [ client.embeds.warnning("You are already in the ride along queue") ]
                });
                return;
            }

            // Handle the ride along number prompt
            client.registerModalCallback(format("rideAlongSpecifyNumber_%s", interaction.id), async (exClient: ExtendedClient, modalInteraction: ModalSubmitInteraction) => {
                const message = modalInteraction.fields.getTextInputValue("rideAlongSpecifyNumber_input");
                
                if (message !== "1" && message !== "2" && message !== "3" && message !== "4") {
                    await modalInteraction.reply({
                        ephemeral: true,
                        embeds: [ client.embeds.warnning("The ride along number must be one of the following values:\n- 1\n- 2\n- 3\n- 4") ]
                    });
                    return;
                }
                
                const rideAlongNum = parseInt(message);

                // Find out the next position in the queue
                const updatedRideAlongQueue = await DbLogic.getAllFtoRideAlongs();
                const nextQueuePos = updatedRideAlongQueue.length + 1;

                const newDbItem = await DbLogic.createFtoRideAlong(member.id, member.nickname ?? member.displayName, rideAlongNum, nextQueuePos);
                
                if (newDbItem === null) {
                    await modalInteraction.reply({
                        ephemeral: true,
                        embeds: [ client.embeds.error("An error occured while trying to add you to the ride along queue") ]
                    });
                    return;
                }

                await client.staticMessages.get("ftoRideAlongQueue")?.update(client);
                await modalInteraction.reply({
                    ephemeral: true,
                    embeds: [ client.embeds.success("Successfully added you to the ride along queue") ]
                });
                await ftoLog(client, format(
                    "%s (%s) has joined the ride along queue for their `%s` ride along, they were placed into position `#%s`", 
                    member.nickname ?? member.user.username, 
                    member.id,
                    cardinalToOrdinal(rideAlongNum),
                    nextQueuePos));
            });

            await interaction.showModal(Constants.SpecifyFtoRideAlongNumber(format("rideAlongSpecifyNumber_%s", interaction.id)));
        }

        const handleLeave = async () => {
            await interaction.deferReply({ ephemeral: true });
            const allowedRoleNames = [ RoleName.DEPUTY_IN_TRAINING ]
            const allowedRoles = allowedRoleNames.map(elem => elem.toString());

            // Check if the executor has the required permissions
            if (member.roles.cache.filter(elem => allowedRoles.includes(elem.name)).size === 0) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.warnning("You do not have the required permissions to do that") ]
                });
                return;
            }

            // Check if the executor is in the queue
            const executorRideAlong = rideAlongQueue.find(elem => elem.id === member.id);
            if (executorRideAlong === undefined) {
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [ client.embeds.warnning("You are not in the ride along queue") ]
                });
                return;
            }

            // Delete the member from the db
            await DbLogic.deleteFtoRideAlongById(executorRideAlong.id);

            // Fix the queue order
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

            // Notify the user
            await interaction.followUp({
                ephemeral: true,
                embeds: [ client.embeds.success("Successfully removed you from the ride along queue") ]
            });

            // Log to fto chat
            await ftoLog(client, format(
                "%s (%s) has left the ride along queue. They were in position `#%s` waiting for their `%s` ride along.", 
                member.nickname ?? member.user.username, 
                member.id,
                executorRideAlong.queuePos,
                cardinalToOrdinal(executorRideAlong.rideAlongNum)));
        }

        switch (interaction.customId) {
            case "ride-along-action-fta":
            case "ride-along-action-fto": await handleFtaFto(); break;
            case "ride-along-action-join-queue": await handleJoin(); break;
            case "ride-along-action-leave-queue": await handleLeave(); break;
            default: break;
        }
    }
});