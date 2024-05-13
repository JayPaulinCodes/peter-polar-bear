import { ActionRowBuilder, BaseInteraction, CacheType, EmbedBuilder, Guild, GuildMember, Role, StringSelectMenuBuilder, StringSelectMenuInteraction, TextChannel, UserResolvable } from "discord.js";
import { BotEmoji, ChannelName, Constants, IVotingHierarchy } from "@bot/constants";
import { Event, ExtendedClient, tryGetChannelByName, tryGetRoleByName, votingLog } from "@bot/core";

// TODO: Refactor this and move it to the selectMenus folder
export default new Event("interactionCreate", async (extendedClient: ExtendedClient, interaction: BaseInteraction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "vote-action") return;
    await interaction.deferReply({ ephemeral: true });

    // Fetch the action
    const selectedAction = interaction.values[0];

    // Make sure the channel exists
    if (interaction.channel === null) { 
        await interaction.followUp({
            embeds: [ extendedClient.embeds.error("Could not find interaction's channel") ]
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
        await interaction.followUp({
            embeds: [ extendedClient.embeds.error("Could not find guild member") ]
        });
        return;
    }

    // Get the next step in the voting hierarchy
    const votingStage = Constants.VotingHierarchy[channel.name];

    switch (selectedAction) {
        case "vote-action-escalate": await handleVoteEscalate(extendedClient, interaction, guild, member, votingStage); break;
        case "vote-action-pass": await handleVotePass(extendedClient, interaction, guild, member); break;
        case "vote-action-fail": await handleVoteFail(extendedClient, interaction, guild, member); break;
        default: break;
    }
});

async function handleVotePass(client: ExtendedClient, interaction: StringSelectMenuInteraction<CacheType>, guild: Guild, member: GuildMember) {

    var footer = await updateEmbedToPass(client, member, guild, interaction.channelId, interaction.message.id);
    while (footer !== null) {
        const splitFooter = footer.text.split("-");
        const channelId = splitFooter[0];
        const messageId = splitFooter[1];
        footer = await updateEmbedToPass(client, member, guild, channelId, messageId);
    }

    await interaction.editReply("Vote has been successfully passed!");

    await votingLog(client, `${member.nickname ?? member.displayName} (${member.id}) passed [a vote](${interaction.message.url}) at <#${interaction.channelId}>`);
}

async function updateEmbedToPass(client: ExtendedClient, member: GuildMember, guild: Guild, channelId: string, messageId: string) {
    const channel = <TextChannel>await guild.channels.fetch(channelId);
    if (channel === null) { return null; }

    // Find the target of the vote
    let voteTarget: "BCSO" | "WSU" | "CID" | "TED" | "WLR" | "K9" = "BCSO";
    switch (channel.name as ChannelName) {
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
    
    const message = await channel.messages.fetch(messageId);
    if (message === null) { return null; }

    const oldEmbed = message.embeds[0];
    
    // Update the old embed
    const newOldEmbed = client.embeds.voteEmbed({
        startingMember: oldEmbed.fields[0].value,
        startTime: oldEmbed.fields[1].value,
        title: oldEmbed.title ?? "Unknown",
        details: oldEmbed.fields[6].value,
        target: voteTarget,
        status: "Approved",
        voteId: oldEmbed.fields[5].value,
        footer: oldEmbed.footer ?? undefined,
        endingMember: member,
        endedTime: new Date(),
        statusTime: new Date()
    });
    
    // Edit the message
    await message.edit({ embeds: [ newOldEmbed ] });

    // If the thread is open close it
    if (!message.thread?.locked) { message.thread?.setLocked(true, "Voting passed"); }
    if (!message.thread?.archived) { message.thread?.setArchived(true, "Voting passed"); }

    return oldEmbed.footer;
}

async function handleVoteFail(client: ExtendedClient, interaction: StringSelectMenuInteraction<CacheType>, guild: Guild, member: GuildMember) {

    var footer = await updateEmbedToFail(client, member, guild, interaction.channelId, interaction.message.id);
    while (footer !== null) {
        const splitFooter = footer.text.split("-");
        const channelId = splitFooter[0];
        const messageId = splitFooter[1];
        footer = await updateEmbedToFail(client, member, guild, channelId, messageId);
    }

    await interaction.editReply("Vote has been successfully failed!");

    await votingLog(client, `${member.nickname ?? member.displayName} (${member.id}) failed [a vote](${interaction.message.url}) at <#${interaction.channelId}>`);
}

async function updateEmbedToFail(client: ExtendedClient, member: GuildMember, guild: Guild, channelId: string, messageId: string) {
    const channel = <TextChannel>await guild.channels.fetch(channelId);
    if (channel === null) { return null; }

    // Find the target of the vote
    let voteTarget: "BCSO" | "WSU" | "CID" | "TED" | "WLR" | "K9" = "BCSO";
    switch (channel.name as ChannelName) {
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
    
    const message = await channel.messages.fetch(messageId);
    if (message === null) { return null; }

    const oldEmbed = message.embeds[0];
    
    // Update the old embed
    const newOldEmbed = client.embeds.voteEmbed({
        startingMember: oldEmbed.fields[0].value,
        startTime: oldEmbed.fields[1].value,
        title: oldEmbed.title ?? "Unknown",
        details: oldEmbed.fields[6].value,
        target: voteTarget,
        status: "Denied",
        voteId: oldEmbed.fields[5].value,
        footer: oldEmbed.footer ?? undefined,
        endingMember: member,
        endedTime: new Date(),
        statusTime: new Date()
    });
    
    // Edit the message
    await message.edit({ embeds: [ newOldEmbed ] });

    // If the thread is open close it
    if (!message.thread?.locked) { message.thread?.setLocked(true, "Voting failed"); }
    if (!message.thread?.archived) { message.thread?.setArchived(true, "Voting failed"); }

    return oldEmbed.footer;
}

async function handleVoteEscalate(client: ExtendedClient, interaction: StringSelectMenuInteraction<CacheType>, guild: Guild, member: GuildMember, votingStage: IVotingHierarchy) {
    const oldEmbed = interaction.message.embeds[0];

    if (votingStage.nextStep === null) { 
        await interaction.followUp({
            embeds: [ client.embeds.error("This vote cannot be escalated") ]
        });
        return;
    }

    // Find the target of the vote
    if (interaction.channel === null) { 
        await interaction.followUp({
            embeds: [ client.embeds.error("Could not find interaction's channel") ]
        });
        return;
    }
    const origChannel = <TextChannel>await interaction.channel.fetch();
    let voteTarget: "BCSO" | "WSU" | "CID" | "TED" | "WLR" | "K9" = "BCSO";
    switch (origChannel.name as ChannelName) {
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
    
    // Update the old vote message
    const newOldEmbed = client.embeds.voteEmbed({
        startingMember: oldEmbed.fields[0].value,
        startTime: oldEmbed.fields[1].value,
        title: oldEmbed.title ?? "Unknown",
        details: oldEmbed.fields[6].value,
        target: voteTarget,
        status: "Closed",
        voteId: oldEmbed.fields[5].value,
        footer: oldEmbed.footer ?? undefined,
        endingMember: member,
        endedTime: new Date(),
        statusTime: new Date()
    });

    // Edit the message
    interaction.message.edit({
        embeds: [ newOldEmbed ],
        components: []
    });

    // Close the thread
    interaction.message.thread?.setLocked(true, "Voting escalated");
    interaction.message.thread?.setArchived(true, "Voting escalated");
    
    // Get the channel name for the target channel
    const channelName = votingStage.nextStep;
    const channel = <TextChannel> tryGetChannelByName(client, channelName);

    if (channel === undefined) { 
        await interaction.followUp({
            embeds: [ client.embeds.error("Could not find channel to escalate vote to") ]
        });
        return;
    }

    // Build the new vote embed
    const voteEmbed = client.embeds.voteEmbed({
        startingMember: oldEmbed.fields[0].value,
        startTime: new Date(),
        title: oldEmbed.title ?? "Unknown",
        details: oldEmbed.fields[6].value,
        target: voteTarget,
        status: "Active",
        footer: { text: `${interaction.channelId}-${oldEmbed.fields[5].value}` }
    });
        
    // Build the vote action row
    const voteActionRow: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(Constants.VoteActionMenu);

    // Determine the roles to ping
    const nextStage = Constants.VotingHierarchy[votingStage.nextStep];
    const rolesToPing: Role[] = [];

    // Fetch roles
    nextStage.rolesToPing.forEach(async roleName => {
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
        startingMember: oldEmbed.fields[0].value,
        startTime: new Date(),
        title: oldEmbed.title ?? "Unknown",
        details: oldEmbed.fields[6].value,
        target: voteTarget,
        status: "Active",
        footer: { text: `${interaction.channelId}-${oldEmbed.fields[5].value}` },
        voteId: voteMessage.id
    });

    // Edit the vote message
    voteMessage = await voteMessage.edit({
        content: rolesToPing.map(role => `<@&${role.id}>`).join(" "),
        embeds: [ editedVoteEmbed ]
    });

    // Create a delib thread
    const delibThread = await voteMessage.startThread({
        name: oldEmbed.title ?? "UNKNOWN",
        reason: "Deliberation thread for new vote"
    });

    // Add those with the ping role and the vote creator to the thread
    const membersToAdd: UserResolvable[] = [];

    for (let i = 0; i < rolesToPing.length; i++) {
        const role = rolesToPing[i];
        membersToAdd.push(...role.members.map(member => member.user));
    }

    membersToAdd.forEach(async member => await delibThread.members.add(member));

    await delibThread.send({
        content: `A new vote has been escalated, please deliberate the topic here if needed!`
    })

    await interaction.editReply("Vote has been successfully escalated!");

    await votingLog(client, `${member.nickname ?? member.displayName} (${member.id}) escalated [a vote](${voteMessage.url}) to <#${channel.id}>`);

}