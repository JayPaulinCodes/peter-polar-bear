import { ChannelName, RoleName } from "../index";

export interface IVotingHierarchy {
    nextStep: ChannelName | null;
    rolesToPing: RoleName[];
}