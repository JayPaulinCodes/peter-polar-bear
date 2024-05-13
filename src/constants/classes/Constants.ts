import { ChannelName, IExandableChannel } from "@bot/constants";

export class Constants {
    public static readonly BlankSpace = "\u200B";

    public static readonly ExpandableChannels: { [key: string]: IExandableChannel; } = {
        [ChannelName.GAME_ROOM]: {
            baseName: ChannelName.GAME_ROOM,
            regexSearch: /^(Game Room )(?:\d*)$/,
            nonNumberChars: 10
        },

        [ChannelName.PATROL_VOICE]: {
            baseName: ChannelName.PATROL_VOICE,
            regexSearch: /^(Patrol Voice #)(?:\d*)$/,
            nonNumberChars: 14
        },

        [ChannelName.TEN_ONE]: {
            baseName: ChannelName.TEN_ONE,
            regexSearch: /^(10-1 #)(?:\d*)$/,
            nonNumberChars: 6
        },
    }
}