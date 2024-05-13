import { ChannelName } from "../index";

export interface IExandableChannel {
    baseName: ChannelName,
    regexSearch: RegExp,
    nonNumberChars: number
}