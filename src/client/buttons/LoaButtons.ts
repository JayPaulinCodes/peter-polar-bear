import { ChannelName, Constants } from "@bot/constants";
import { Button, ExtendedClient, generalLog, tryFindEmoji, tryGetChannelByName } from "@bot/core";
import { ModalSubmitInteraction } from "discord.js";
import { format } from "node:util";

export default new Button({
    customIds: [
        "loa-returning",
        "loa-extending"
    ],
    run: async ({ client, interaction }) => {
        const dojrpWebsiteRegEx = /(https:\/\/www\.dojrp\.com\/.*)/g;

        const handleReturning = async () => {
            client.registerModalCallback(format("loaReturning_%s", interaction.id), async (exClient: ExtendedClient, modalInteraction: ModalSubmitInteraction) => {
                const loaLink = modalInteraction.fields.getTextInputValue("loaReturning_linkToLoa");
                
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

                // Check the provided link
                if (loaLink.match(dojrpWebsiteRegEx) === null) {
                    await modalInteraction.reply({
                        ephemeral: true,
                        embeds: [ client.embeds.error("The provided link does not seem to be a valid dojrp.com link.\nIf you believe this to be an error please contact BCSO CoC.") ]
                    });
                    return;
                }

                // Get the loa channel
                const loaChannel = tryGetChannelByName(client, ChannelName.LEAVE_OF_ABSENCES);
                if (loaChannel === undefined || !loaChannel.isTextBased()) {
                    await interaction.followUp({
                        ephemeral: true,
                        embeds: [ client.embeds.error("Could not find the loa channel") ]
                    });
                    return;
                }

                // Send the return message
                await loaChannel.send({
                    embeds: [ client.embeds.loaReturning(member, loaLink) ],
                    components: [ Constants.LoaReturningExtendingButtons(tryFindEmoji(client, "staff")) ]
                })

                // Follow up
                await modalInteraction.reply({
                    ephemeral: true,
                    embeds: [ client.embeds.success("Your LOA return has been submitted! Please be patient while CoC review it.") ]
                });

                // Log to general log
                await generalLog(client, format(
                    "%s (%s) submitted their LOA return with the link: `%s`",
                    member.nickname ?? member.displayName,
                    member.id,
                    loaLink
                ));
            });

            await interaction.showModal(Constants.LoaReturning(format("loaReturning_%s", interaction.id)));
        }
    
        const handleExtending = async () => {
            client.registerModalCallback(format("loaExtending_%s", interaction.id), async (exClient: ExtendedClient, modalInteraction: ModalSubmitInteraction) => {
                const loaLink = modalInteraction.fields.getTextInputValue("loaExtending_linkToLoa");
                
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

                // Check the provided link
                if (loaLink.match(dojrpWebsiteRegEx) === null) {
                    await modalInteraction.reply({
                        ephemeral: true,
                        embeds: [ client.embeds.error("The provided link does not seem to be a valid dojrp.com link.\nIf you believe this to be an error please contact BCSO CoC.") ]
                    });
                    return;
                }

                // Get the loa channel
                const loaChannel = tryGetChannelByName(client, ChannelName.LEAVE_OF_ABSENCES);
                if (loaChannel === undefined || !loaChannel.isTextBased()) {
                    await interaction.followUp({
                        ephemeral: true,
                        embeds: [ client.embeds.error("Could not find the loa channel") ]
                    });
                    return;
                }

                // Send the return message
                await loaChannel.send({
                    embeds: [ client.embeds.loaExtending(member, loaLink) ],
                    components: [ Constants.LoaReturningExtendingButtons(tryFindEmoji(client, "staff")) ]
                })

                // Follow up
                await modalInteraction.reply({
                    ephemeral: true,
                    embeds: [ client.embeds.success("Your LOA extention has been submitted! Please be patient while CoC review it.") ]
                });

                // Log to general log
                await generalLog(client, format(
                    "%s (%s) submitted a LOA extention with the link: `%s`",
                    member.nickname ?? member.displayName,
                    member.id,
                    loaLink
                ));
            });

            await interaction.showModal(Constants.LoaExtending(format("loaExtending_%s", interaction.id)));
        }
    
        switch (interaction.customId) {
            case "loa-returning": await handleReturning(); break;
            case "loa-extending": await handleExtending(); break;
            default: break;
        }
    }
});