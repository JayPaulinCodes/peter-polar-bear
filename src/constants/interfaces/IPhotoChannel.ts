import { BotEmoji, ChannelName } from "../index";

export interface IPhotoChannel {
    channelName: ChannelName;
    messageMustContainImage: boolean;
    voteEmoji?: string | BotEmoji;
    voteEmojiIsCustom?: boolean;
    autoReact?: boolean;
    onlyAllowVoteEmoji?: boolean;
}