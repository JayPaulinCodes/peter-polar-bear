import { GuildMemberResolvable } from "discord.js";

export interface IFtoRideAlong {
    position: number;
    name: string;
    id: GuildMemberResolvable
    rideAlongNumber: number;
}