import { RowDataPacket } from "mysql2";

export interface DbFtoRideAlong extends RowDataPacket {
    id: string;
    username: string;
    rideAlongNum: number;
    queuePos: number;
    updated: Date;
    created: Date;
}