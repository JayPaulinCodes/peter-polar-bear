import { createPool, FieldPacket, Pool, PoolOptions, ProcedureCallPacket, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { rejects } from "node:assert";

export class DbManager {
    private static readonly options: PoolOptions = {
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT ?? "3306"),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT ?? "100"),
        maxIdle: parseInt(process.env.MYSQL_MAX_IDLE ?? "10"),
        idleTimeout: parseInt(process.env.MYSQL_IDLE_TIMEOUT ?? "30000"),
        rowsAsArray: false,
        multipleStatements: false
    }
    private static readonly pool: Pool = createPool(this.options);

    // public static async ping(): Promise<void> {
    //     const connection = await this.pool.getConnection();
    //     await connection.ping();
    //     this.pool.releaseConnection(connection);
    // }

    public static async query<
        T extends 
        RowDataPacket[] | 
        ResultSetHeader[] | 
        RowDataPacket[][] | 
        ProcedureCallPacket
    >(sql: string, values?: any | any[]): Promise<[T, FieldPacket[]]> {
        // const connection = await this.pool.getConnection();
        // const [rows, fields] = await connection.query<T>(sql, values);
        // this.pool.releaseConnection(connection);
        // return [rows, fields];

        return new Promise<[T, FieldPacket[]]>(async (resolve, reject) => {
            this.pool.getConnection().then(connection => {
                connection.query<T>(sql, values).then(([rows, fields]) => {
                    this.pool.releaseConnection(connection);
                    resolve([rows, fields]);
                }).catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }

    public static async execute<
        T extends 
        RowDataPacket[] | 
        ResultSetHeader[] | 
        RowDataPacket[][] | 
        ProcedureCallPacket
    >(sql: string, values?: any | any[]): Promise<[T, FieldPacket[]]> {
        // const connection = await this.pool.getConnection();
        // const [rows, fields] = await connection.execute<T>(sql, values);
        // this.pool.releaseConnection(connection);
        // return [rows, fields];

        return new Promise<[T, FieldPacket[]]>(async (resolve, reject) => {
            this.pool.getConnection().then(connection => {
                connection.execute<T>(sql, values).then(([rows, fields]) => {
                    this.pool.releaseConnection(connection);
                    resolve([rows, fields]);
                }).catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }

    public static async select<T extends RowDataPacket[]>(sql: string, values?: any | any[]): Promise<[T, FieldPacket[]]> {
        return values === undefined ? await this.query<T>(sql, values) : await this.execute<T>(sql, values);
    }

    public static async insert<T extends ResultSetHeader>(sql: string, values?: any | any[]): Promise<[T, FieldPacket[]]> {
        return values === undefined ? await this.query<T>(sql, values) : await this.execute<T>(sql, values);
    }

    public static async update<T extends ResultSetHeader>(sql: string, values?: any | any[]): Promise<[T, FieldPacket[]]> {
        return values === undefined ? await this.query<T>(sql, values) : await this.execute<T>(sql, values);
    }

    public static async delete<T extends ResultSetHeader>(sql: string, values?: any | any[]): Promise<[T, FieldPacket[]]> {
        return values === undefined ? await this.query<T>(sql, values) : await this.execute<T>(sql, values);
    }
}