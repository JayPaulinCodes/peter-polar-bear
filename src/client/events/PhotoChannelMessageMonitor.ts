import { Message} from "discord.js";
import { ExtendedClient, Event, tryFindEmoji } from "@bot/core";
import { BotEmoji, Constants } from "@bot/constants";
import { IPhotoChannel } from "constants/interfaces/IPhotoChannel";

export default new Event("messageCreate", async (extendedClient: ExtendedClient, message: Message) => {
    const channel = message.channel;
    if (channel.isDMBased()) return;
    if (!channel.isTextBased()) return;

    // Check if the message is in a photo channel
    const photoChannel: IPhotoChannel | undefined = Constants.PhotoChannels[channel.name] ?? undefined;
    if (photoChannel === undefined) return;

    // Check if we only allow messages with images
    const imageAttachments = message.attachments.filter(elem => elem.contentType?.includes("image"));
    if (photoChannel.messageMustContainImage && imageAttachments.size <= 0) {
        await message.delete();
        return;
    }

    // Handle automatic reactions
    if (photoChannel.autoReact === true && photoChannel.voteEmoji !== undefined) {
        // Try to find the voting emoji
        const votingEmoji = photoChannel.voteEmojiIsCustom === false 
            ? photoChannel.voteEmoji 
            : tryFindEmoji(extendedClient, photoChannel.voteEmoji);

        if (votingEmoji !== undefined) await message.react(votingEmoji);
    }
});