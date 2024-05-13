import { ActionRowBuilder, Role, SlashCommandBuilder, StringSelectMenuBuilder, TextChannel, UserResolvable } from "discord.js";
import { BotEmoji, ChannelName, Constants } from "@bot/constants";
import { Command, tryGetRoleByName, votingLog } from "@bot/core";

export default new Command({
    data: new SlashCommandBuilder()
        .setName("vote")
        .setDescription("Starts a new vote")
        .addStringOption(option => option
            .setName("title")
            .setDescription("The title of the vote")
            .setRequired(true)
            .setMaxLength(256))
        .addStringOption(option => option
            .setName("details")
            .setDescription("The vote details")
            .setRequired(true)
            .setMaxLength(256))
        .setDMPermission(false),
    run: async ({ client, interaction }) => {
        await interaction.deferReply({ ephemeral: true });

        const allowedChannels: string[] = Object.keys(Constants.VotingHierarchy);
        
        // Make sure the channel exists
        if (interaction.channel === null) { 
            await interaction.followUp({
                embeds: [ client.embeds.error("Could not find interaction's channel") ]
            });
            return;
        }
        
        // Fetch the channel
        const channel = <TextChannel>await interaction.channel.fetch();
        
        // Fetch the guild
        const guild = channel.guild;
        
        // Fetch the user who ran the command
        const user = await interaction.user.fetch();
        const member = await interaction.guild?.members.fetch(user.id);
        if (member === undefined) { 
            await interaction.followUp({
                embeds: [ client.embeds.error("Could not find guild member") ]
            });
            return;
        }

        // Check if the channel is a valid one
        const channelName = allowedChannels.includes(channel.name) ? channel.name as ChannelName : null;

        if (channelName === null) { 
            await interaction.followUp({
                embeds: [ client.embeds.error("Could not find channel name") ]
            });
            return;
        }

        // Get the voting stage from the voting hierarchy
        const votingStage = Constants.VotingHierarchy[channelName];

        // Get the command params and make sure they exist
        const voteTitle = <string | undefined>interaction.options.get("title")?.value;
        const voteDetails = <string | undefined>interaction.options.get("details")?.value;
        if (voteTitle === undefined || voteDetails === undefined) { 
            await interaction.followUp({
                embeds: [ client.embeds.error("Could not find command params") ]
            });
            return;
        }

        // Find the target of the vote
        let voteTarget: "BCSO" | "WSU" | "CID" | "TED" | "WLR" | "K9" = "BCSO";
        switch (channelName) {
            case ChannelName.WSU_SUPERVISORS:
            case ChannelName.WSU_TEAM_LEADS:
                voteTarget = "WSU";
                break;
                
            case ChannelName.WLR_SUPERVISORS:
            case ChannelName.SENIOR_RANGERS:
                voteTarget = "WLR";
                break;
                
            case ChannelName.CID_SUPERVISORS:
            case ChannelName.CID_SENIOR_INVESTIGATORS:
                voteTarget = "CID";
                break;
                
            case ChannelName.TED_SUPERVISORS:
            case ChannelName.TED_ADVISORS:
                voteTarget = "TED";
                break;
                
            case ChannelName.CANINE_SUPERVISORS:
            case ChannelName.CANINE_SENIORS:
                voteTarget = "K9";
                break;

            default:
                voteTarget = "BCSO";
                break;
        }

        // Build the vote embed
        const voteEmbed = client.embeds.voteEmbed({
            startingMember: member,
            title: voteTitle,
            details: voteDetails,
            target: voteTarget,
            status: "Active",
            startTime: new Date()
        });

        // Build the vote action row
        const voteActionRow: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(Constants.VoteActionMenu);

        // Determine the roles to ping
        const rolesToPing: Role[] = [];

        // Fetch roles
        votingStage.rolesToPing.forEach(async roleName => {
            const role = tryGetRoleByName(client, roleName);
            if (role !== undefined) { rolesToPing.push(role); }
        });

        // Send the vote embed
        var voteMessage = await channel.send({
            content: rolesToPing.map(role => `<@&${role.id}>`).join(" "),
            embeds: [ voteEmbed ],
            components: [ voteActionRow ]
        });

        // Add voting reactions
        await voteMessage.react(BotEmoji.VOTING_CHECK);
        await voteMessage.react(BotEmoji.VOTING_CROSS);
        await voteMessage.react(BotEmoji.VOTING_QUESTION);

        // Update the vote embed
        const editedVoteEmbed = client.embeds.voteEmbed({
            startingMember: member,
            title: voteTitle,
            details: voteDetails,
            target: voteTarget,
            status: "Active",
            startTime: new Date(),
            voteId: voteMessage.id
        });

        // Edit the vote message
        voteMessage = await voteMessage.edit({
            content: rolesToPing.map(role => `<@&${role.id}>`).join(" "),
            embeds: [ editedVoteEmbed ]
        });

        // Create a delib thread
        const delibThread = await voteMessage.startThread({
            name: voteTitle,
            reason: "Deliberation thread for new vote"
        });

        // Add those with the ping role and the vote creator to the thread
        const membersToAdd: UserResolvable[] = [];

        for (let i = 0; i < rolesToPing.length; i++) {
            const role = rolesToPing[i];
            membersToAdd.push(...role.members.map(member => member.user));
        }

        membersToAdd.forEach(member => delibThread.members.add(member));

        await delibThread.send({
            content: `<@${member.id}> started a new vote, please deliberate the topic here if needed!`
        })

        await interaction.editReply("Vote has been successfully submitted!");

        await votingLog(client, `${member.nickname ?? member.displayName} (${member.id}) started a [new vote](${voteMessage.url}) in <#${channel.id}>`);
    }
});

