import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import { ExtendedClient, Event, tryFindEmoji } from "@bot/core";
import { Constants, IExandableChannel } from "@bot/constants";
import { IPhotoChannel } from "constants/interfaces/IPhotoChannel";

export default new Event("messageReactionAdd", async (extendedClient: ExtendedClient, reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
    const channel = reaction.message.channel;
    if (channel.isDMBased()) return;
    if (!channel.isTextBased()) return;

    // Check if the message is in a photo channel
    const photoChannel: IPhotoChannel | undefined = Constants.PhotoChannels[channel.name] ?? undefined;
    if (photoChannel === undefined) return;

    // Check if the channel has a vote emoji
    if (photoChannel.voteEmoji === undefined) return;
    const votingEmoji = photoChannel.voteEmojiIsCustom === false 
        ? photoChannel.voteEmoji 
        : tryFindEmoji(extendedClient, photoChannel.voteEmoji);
    if (votingEmoji === undefined) return;

    // Check if the reaction matches the vote emoji
    if (reaction.emoji.name === (typeof votingEmoji === "string" ? votingEmoji : votingEmoji.name)) return;

    // Check if we allow reactions other than the vote emoji
    if (photoChannel.onlyAllowVoteEmoji === true) {
        await reaction.remove();
    }
});