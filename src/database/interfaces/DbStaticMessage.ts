import { RowDataPacket } from "mysql2";

export interface DbStaticMessage extends RowDataPacket {
    id: number;
    name: string;
    guidId: string;
    channelId: string;
    messageId: string;
    updated: Date;
    created: Date;
}