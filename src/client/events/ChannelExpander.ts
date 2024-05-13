import { ChannelType, Collection, VoiceChannel, VoiceState } from "discord.js";
import { ExtendedClient, Event } from "@bot/core";
import { Constants, IExandableChannel } from "@bot/constants";

export default new Event("voiceStateUpdate", async (extendedClient: ExtendedClient, oldState: VoiceState, newState: VoiceState) => {
    // Determine if the client joined or left a voice channel
    let joinedChannel = false;
    let leftChannel = false;
    if (oldState.channel === null && newState.channel !== null) {
        joinedChannel = true;
    } else if (oldState.channel !== null && newState.channel === null) {
        leftChannel = true;
    } else if (oldState.channel !== null && newState.channel !== null && oldState.channelId !== newState.channelId) {
        joinedChannel = true;
        leftChannel = true;
    } else {
        return;
    }

    const handleJoin = async (state: VoiceState) => {
        // Get the channel
        const channel = state.channel;
        if (channel === null) { return; }
    
        // Figure out if the channel is exandable
        let expandableChannelType: IExandableChannel | undefined;
        for (const key in Constants.ExpandableChannels) {
            const expandableChannel = Constants.ExpandableChannels[key];
            if (expandableChannel.regexSearch.test(channel.name)) { 
                expandableChannelType = expandableChannel;
                break;
            }
        }
        if (expandableChannelType === undefined) { return; }
    
        // Make a list of all the channels which match our expand search
        const channels = <Collection<string, VoiceChannel>>state.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice && expandableChannelType?.regexSearch.test(channel.name));
    
        // See if any channels are empty
        const emptyChannels = channels.filter(channel => channel.members.size === 0);
        const areAnyChannelsEmpty = emptyChannels.size > 0;
        if (areAnyChannelsEmpty) { return; }
        
        // Get the base channel
        const baseChannel = channels.find(channel => channel.name === expandableChannelType?.baseName);
    
        // Determine the name of the new channel
        let newChannelName = undefined;
        let currentIndex = 2;
        while (newChannelName === undefined) {
            const tryName = `${expandableChannelType?.baseName.slice(0, expandableChannelType?.nonNumberChars)}${currentIndex}`
            if (channels.find(channel => channel.name === tryName) === undefined) {
                newChannelName = tryName;
                break;
            }
            currentIndex++
        }
    
        // Clone the channel
        await baseChannel?.clone({
            reason: "Automatic Channel Expansion - Channel creation",
            name: newChannelName
        });
    }

    const handleLeave = async (state: VoiceState) => {
        // Get the channel
        const channel = state.channel;
        if (channel === null) { return; }
    
        // Figure out if the channel is exandable
        let expandableChannelType: IExandableChannel | undefined;
        for (const key in Constants.ExpandableChannels) {
            const expandableChannel = Constants.ExpandableChannels[key];
            if (expandableChannel.regexSearch.test(channel.name)) { 
                expandableChannelType = expandableChannel;
                break;
            }
        }
        if (expandableChannelType === undefined) { return; }
    
        // Make a list of all the channels which match our expand search
        const channels = <Collection<string, VoiceChannel>>state.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice && expandableChannelType?.regexSearch.test(channel.name));
    
        // See if any channels are empty
        const emptyChannels = channels.filter(channel => channel.members.size === 0);
        const areAnyChannelsEmpty = emptyChannels.size > 0;
        if (!areAnyChannelsEmpty) { return; }
    
        // Determine which channel will stay empty
        let lowestEmptyChannel: VoiceChannel | undefined
        channels.sort((a, b) => parseInt(a.name.slice(expandableChannelType?.nonNumberChars)) - parseInt(b.name.slice(expandableChannelType?.nonNumberChars)));
        channels.forEach(channel => {
            if (lowestEmptyChannel === undefined && channel?.members.size === 0) {
                lowestEmptyChannel = channel;
            }
        })
        if (lowestEmptyChannel === undefined) { return; }
    
        // Delete all other empty channels
        channels.forEach(async channel => {
            if (channel.members.size === 0 && channel.id !== lowestEmptyChannel?.id) { 
                await channel.delete("Automatic Channel Expansion - Channel deletion"); 
            }
        });
    }

    if (leftChannel) { await handleLeave(oldState); }
    if (joinedChannel) { await handleJoin(newState); }
});
