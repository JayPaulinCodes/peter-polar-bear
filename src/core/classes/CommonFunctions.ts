import { BaseInteraction, Guild, GuildBasedChannel, Role } from "discord.js";
import { format } from "util";
import { ExtendedClient } from "@bot/core";
import { ChannelName, RoleName } from "@bot/constants";

export function numberWithCommas(number: number | bigint): string {
    return number.toString().replace( /\B(?=(\d{3})+(?!\d))/g, "," );
}

export function toUnixTime(date?: Date | number | undefined) {
    const _date = date === undefined ? new Date() : new Date(date);
    return Math.floor(_date.getTime() / 1000);
}

export function cardinalToOrdinal(cardinalNumber: number): string {
    const CARDINAL_MODULUS = cardinalNumber % 10;
    const CARDINAL_MODULUS_2 = cardinalNumber % 100;

    if (CARDINAL_MODULUS == 1 && CARDINAL_MODULUS_2 != 11) return cardinalNumber + "st";
    if (CARDINAL_MODULUS == 2 && CARDINAL_MODULUS_2 != 12) return cardinalNumber + "nd";
    if (CARDINAL_MODULUS == 3 && CARDINAL_MODULUS_2 != 13) return cardinalNumber + "rd";
    return cardinalNumber + "th";
}

export function splitMessage(message: string, length: number = 2000, delimeter: string = "\n") {
    const messageSplit = message.split("\n").map(elem => elem + "\n");
    const result: string[] = [ "" ];

    messageSplit.forEach(elem => {
        const currentIndex = result.length - 1;
        const currentItem = result[currentIndex];
        
        if (result.length >= 0 && currentItem.length + elem.length <= length) {
            result[currentIndex] = currentItem + elem;
        } else {
            result.push(elem);
        }
    });

    return result;
}

export function homeGuildId(): string {
    return process.env.GUILD_ID ?? "1239027847918653470";
}

export function homeGuild(client: ExtendedClient): Guild | undefined{
    return client.guilds.cache.find(elem => elem.id === homeGuildId());
}

export function tryFindEmoji(client: ExtendedClient, name: string, guild: string = homeGuildId()) {
    return client.emojis.cache.find(elem => elem.guild.id === guild && elem.name === name);
}

export function tryGetChannelByName(client: ExtendedClient, channelName: string): GuildBasedChannel | undefined {
    const guild = client.guilds.cache.find(elem => elem.id === homeGuildId());
    return guild?.channels.cache.find(elem => elem.name === channelName);
}

export function tryGetRoleByName(client: ExtendedClient, roleName: string): Role | undefined {
    const guild = client.guilds.cache.find(elem => elem.id === homeGuildId());
    return guild?.roles.cache.find(elem => elem.name === roleName);
}

export async function generalLog(client: ExtendedClient, message: string) {
    client.logger.log(message);
    // const channel = tryGetChannelByName(client, ChannelName.GENERAL_LOGS);
    // if (channel === undefined || !channel.isTextBased()) return;
    // await channel.send({
    //     content: format("[<t:%s:F>] %s", toUnixTime(), message)
    // });
}

export async function ftoLog(client: ExtendedClient, message: string) {
    client.logger.log(message);
    // const channel = tryGetChannelByName(client, ChannelName.FTO_LEAD_LOGS);
    // if (channel === undefined || !channel.isTextBased()) return;
    // await channel.send({
    //     content: format("[<t:%s:F>] %s", toUnixTime(), message)
    // });
}

export async function votingLog(client: ExtendedClient, message: string) {
    client.logger.log(message);
    // const channel = tryGetChannelByName(client, ChannelName.VOTING_LOGS);
    // if (channel === undefined || !channel.isTextBased()) return;
    // await channel.send({
    //     content: format("[<t:%s:F>] %s", toUnixTime(), message)
    // });
}

export async function errorLog(client: ExtendedClient, error: Error, interaction?: BaseInteraction) {
    // Log to error channel
    // const guild = homeGuild(client);
    // if (guild === undefined) return;

    // const errorChannel = tryGetChannelByName(client, ChannelName.ERROR_LOGS);
    // if (errorChannel === undefined || !errorChannel.isTextBased()) return;

    // const deputronTeamRole = tryGetRoleByName(client, RoleName.DEPUTRON_TEAM);

    // const interactionVal = interaction === undefined ? "N/A" : interaction.id;
    // const channelId = interaction === undefined ? "N/A" : interaction.channel === null ? "Unknown" : `<#${interaction.channelId}> (${interaction.channelId})`;
    // const userId = interaction === undefined ? "N/A" : interaction.member === null ? "Unknown" : `<@${interaction.member.user.id}> (${interaction.member.user.id})`;
    // const message = format(
    //     "%s **An error occured**\n__Timestamp:__ <t:%s:F> (<t:%s:R>)\n__Interaction ID:__ %s\n__Channel ID:__ %s\n__User ID:__ %s\n__Associated Log File:__ %s\n```%s```",
    //     deputronTeamRole === undefined ? "" : deputronTeamRole?.toString(),
    //     toUnixTime(),
    //     toUnixTime(),
    //     interactionVal,
    //     channelId,
    //     userId,
    //     client.logger.stream?.path ?? "N/A",
    //     error.stack?.toString() ?? "Unknown")
    
    // await errorChannel.send({ content: message });
}