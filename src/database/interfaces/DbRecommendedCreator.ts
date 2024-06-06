import { RowDataPacket } from "mysql2";

export interface DbRecommendedCreator extends RowDataPacket {
    id: number;
    name: string;
    discordId: string;
    twitchUrl: string | null;
    youtubeUrl: string | null;
    updated: Date;
    created: Date;
}