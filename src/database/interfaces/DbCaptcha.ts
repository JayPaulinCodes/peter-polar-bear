import { RowDataPacket } from "mysql2";

export interface DbCaptcha extends RowDataPacket {
    id: number;
    assignedUser: string;
    image: Buffer;
    dataUrl: string;
    value: string;
    expires: Date;
    updated: Date;
    created: Date;
}