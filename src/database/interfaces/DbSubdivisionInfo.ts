import { RowDataPacket } from "mysql2";

export interface DbSubdivisionInfo extends RowDataPacket {
    id: string;
    name: string;
    abbreaviation: string;
    applicationsOpen: boolean;
    minimumRank: string;
    updated: Date;
    created: Date;
}