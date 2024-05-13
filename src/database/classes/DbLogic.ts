import { DbCaptcha, DbManager, DbStaticMessage } from "@bot/database";
import { User } from "discord.js";
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

    public static async getCaptchaById(id: number): Promise<DbCaptcha | null> {
        // Define variables
        const query = "SELECT * FROM `captchas` WHERE `id` = ?";
        const params = [ id ];

        // Execute query
        const [ results, fields ] = await DbManager.select<DbCaptcha[]>(query, params);

        // Process results
        if (results.length === 0) return null;

        return results[0];
    }

    public static async getCaptchaByUserId(userId: string): Promise<DbCaptcha | null> {
        // Define variables
        const query = "SELECT * FROM `captchas` WHERE `assignedUser` = ?";
        const params = [ userId ];

        // Execute query
        const [ results, fields ] = await DbManager.select<DbCaptcha[]>(query, params);

        // Process results
        if (results.length === 0) return null;

        return results[0];
    }

    public static async getCaptchaByUser(user: User): Promise<DbCaptcha | null> {
        // Define variables
        const query = "SELECT * FROM `captchas` WHERE `assignedUser` = ?";
        const params = [ user.id ];

        // Execute query
        const [ results, fields ] = await DbManager.select<DbCaptcha[]>(query, params);

        // Process results
        if (results.length === 0) return null;

        return results[0];
    }

    public static async createCaptcha(assignedUser: string, image: Buffer, dataUrl: string, value: string, expires: Date): Promise<DbCaptcha | null> {
        // Define variables
        const query = "INSERT INTO captchas (assignedUser, image, dataURL, value, expires) VALUES (?, BINARY(?), ?, ?, ?)";
        const params = [ assignedUser, image, dataUrl, value, expires ];

        // Execute query
        const [ results, fields ] = await DbManager.insert(query, params);

        return DbLogic.getCaptchaById(results.insertId);
    }

    public static async deleteCaptchaById(id: number): Promise<void> {
        // Define variables
        const query = "DELETE FROM `captchas` WHERE `id` = ?";
        const params = [ id ];

        // Execute query
        const [ results, fields ] = await DbManager.delete(query, params);

        return;
    }
}