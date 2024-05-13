import { DbFtoRideAlong, DbManager, DbStaticMessage, DbSubdivisionInfo } from "@bot/database";
import { FieldPacket, RowDataPacket } from "mysql2";

export class DbLogic {
    public static async ping(): Promise<[RowDataPacket[], FieldPacket[]]> {
        const [ results, fields ] = await DbManager.select("SELECT 1");
        return [ results, fields ];
    }
    
    public static async getAllStaticMessages(): Promise<DbStaticMessage[]> {
        // Define variables
        const query = "SELECT * FROM `static-message`";

        // Execute query
        const [ results, fields ] = await DbManager.select<DbStaticMessage[]>(query);

        // Process results
        return results;
    }

    public static async getStaticMessageById(id: number): Promise<DbStaticMessage | null> {
        // Define variables
        const query = "SELECT * FROM `static-message` WHERE `id` = ?";
        const params = [ id ];

        // Execute query
        const [ results, fields ] = await DbManager.select<DbStaticMessage[]>(query, params);

        // Process results
        if (results.length === 0) return null;

        return results[0];
    }

    public static async getStaticMessage(name: string): Promise<DbStaticMessage | null> {
        // Define variables
        const query = "SELECT * FROM `static-message` WHERE `name` = ?";
        const params = [ name ];

        // Execute query
        const [ results, fields ] = await DbManager.select<DbStaticMessage[]>(query, params);

        // Process results
        if (results.length === 0) return null;

        return results[0];
    }

    public static async createStaticMessage(name: string, guildId: string, channelId: string, messageId: string): Promise<DbStaticMessage | null> {
        // Define variables
        const query = "INSERT INTO `static-message` (`name`, `guildId`, `channelId`, `messageId`) VALUES (?, ?, ?, ?)";
        const params = [ name, guildId, channelId, messageId ];

        // Execute query
        const [ results, fields ] = await DbManager.insert(query, params);

        return DbLogic.getStaticMessageById(results.insertId);
    }

    public static async updateStaticMessage(item: Partial<DbStaticMessage>): Promise<DbStaticMessage | null> {
        if (item.id === undefined) return null;
        
        // Define variables
        const queryValues: any[][] = [];
        if (item.name !== undefined) queryValues.push([ "`name` = ?", item.name]);
        if (item.guildId !== undefined) queryValues.push([ "`guildId` = ?", item.guildId]);
        if (item.channelId !== undefined) queryValues.push([ "`channelId` = ?", item.channelId]);
        if (item.messageId !== undefined) queryValues.push([ "`messageId` = ?", item.messageId]);

        const query = `UPDATE \`static-message\` SET ${queryValues.map(elem => elem[0]).join(", ")} WHERE \`id\` = ?`;
        const params = queryValues.map(elem => elem[1]);
        params.push(item.id);

        // Execute query
        await DbManager.update(query, params);
        
        // Return updated user
        return await DbLogic.getStaticMessageById(item.id);
    }

    public static async getAllFtoRideAlongs(): Promise<DbFtoRideAlong[]> {
        // Define variables
        const query = "SELECT * FROM `fto-ride-along`";

        // Execute query
        const [ results, fields ] = await DbManager.select<DbFtoRideAlong[]>(query);

        // Process results
        return results ?? [];
    }

    public static async getFtoRideAlongById(id: string): Promise<DbFtoRideAlong | null> {
        // Define variables
        const query = "SELECT * FROM `fto-ride-along` WHERE `id` = ?";
        const params = [ id ];

        // Execute query
        const [ results, fields ] = await DbManager.select<DbFtoRideAlong[]>(query, params);

        // Process results
        if (results.length === 0) return null;

        return results[0];
    }

    public static async createFtoRideAlong(userId: string, username: string, rideAlongNum: number, queuePos: number): Promise<DbFtoRideAlong | null> {
        // Define variables
        const query = "INSERT INTO `fto-ride-along` (`id`, `username`, `rideAlongNum`, `queuePos`) VALUES (?, ?, ?, ?)";
        const params = [ userId, username, rideAlongNum, queuePos ];

        // Execute query
        const [ results, fields ] = await DbManager.insert(query, params);

        return DbLogic.getFtoRideAlongById(userId);
    }

    public static async updateFtoRideAlong(item: Partial<DbFtoRideAlong>): Promise<DbFtoRideAlong | null> {
        if (item.id === undefined) return null;
        
        // Define variables
        const queryValues: any[][] = [];
        if (item.rideAlongNum !== undefined) queryValues.push([ "`rideAlongNum` = ?", item.rideAlongNum]);
        if (item.username !== undefined) queryValues.push([ "`username` = ?", item.username]);
        if (item.queuePos !== undefined) queryValues.push([ "`queuePos` = ?", item.queuePos]);

        const query = `UPDATE \`fto-ride-along\` SET ${queryValues.map(elem => elem[0]).join(", ")} WHERE \`id\` = ?`;
        const params = queryValues.map(elem => elem[1]);
        params.push(item.id);

        // Execute query
        await DbManager.update(query, params);
        
        // Return updated user
        return await DbLogic.getFtoRideAlongById(item.id);
    }

    public static async deleteFtoRideAlongById(id: string): Promise<void> {
        // Define variables
        const query = "DELETE FROM `fto-ride-along` WHERE `id` = ?";
        const params = [ id ];

        // Execute query
        const [ results, fields ] = await DbManager.delete(query, params);

        // Process results
        return;
    }

    public static async deleteAllFtoRideAlong(): Promise<void> {
        // Define variables
        const query = "DELETE FROM `fto-ride-along`";

        // Execute query
        const [ results, fields ] = await DbManager.delete(query);

        // Process results
        return;
    }
    
    public static async getAllSubdivisionInfo(): Promise<DbSubdivisionInfo[]> {
        // Define variables
        const query = "SELECT * FROM `subdivision-info`";

        // Execute query
        const [ results, fields ] = await DbManager.select<DbSubdivisionInfo[]>(query);

        // Process results
        return results;
    }
    
    public static async getSubdivisionInfoById(id: number): Promise<DbSubdivisionInfo | null> {
        // Define variables
        const query = "SELECT * FROM `subdivision-info` WHERE `id` = ?";
        const params = [ id ];

        // Execute query
        const [ results, fields ] = await DbManager.select<DbSubdivisionInfo[]>(query, params);

        // Process results
        if (results.length === 0) return null;

        return results[0];
    }
    
    public static async getSubdivisionInfoByAbbr(abbreaviation: string): Promise<DbSubdivisionInfo | null> {
        // Define variables
        const query = "SELECT * FROM `subdivision-info` WHERE `abbreaviation` = ?";
        const params = [ abbreaviation ];

        // Execute query
        const [ results, fields ] = await DbManager.select<DbSubdivisionInfo[]>(query, params);

        // Process results
        if (results.length === 0) return null;

        return results[0];
    }

    public static async updateSubdivisionInfo(item: Partial<DbFtoRideAlong>): Promise<DbFtoRideAlong | null> {
        if (item.id === undefined) return null;
        
        // Define variables
        const queryValues: any[][] = [];
        if (item.abbreaviation !== undefined) queryValues.push([ "`abbreaviation` = ?", item.abbreaviation]);
        if (item.name !== undefined) queryValues.push([ "`name` = ?", item.name]);
        if (item.applicationsOpen !== undefined) queryValues.push([ "`applicationsOpen` = ?", item.applicationsOpen]);
        if (item.minimumRank !== undefined) queryValues.push([ "`minimumRank` = ?", item.minimumRank]);

        const query = `UPDATE \`subdivision-info\` SET ${queryValues.map(elem => elem[0]).join(", ")} WHERE \`id\` = ?`;
        const params = queryValues.map(elem => elem[1]);
        params.push(item.id);

        // Execute query
        await DbManager.update(query, params);
        
        // Return updated user
        return await DbLogic.getFtoRideAlongById(item.id);
    }
}