import { Db, MongoClient } from 'mongodb';
import { initializeIndexes } from './indexes';

const uri = 'mongodb://localhost:12698';
const dbName = 'sgs';

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<Db> {
    if (db) return db;

    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log('Successfully connected to MongoDB');
    await initializeIndexes(db);
    return db;
}

export async function closeDatabase(): Promise<void> {
    if (client) {
        await client.close();
    }
}

export function getDatabase(): Db {
    if (!db) {
        throw new Error(
            'Database not initialized. Call connectToDatabase first.'
        );
    }
    return db;
}
