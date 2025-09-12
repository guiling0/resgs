"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
exports.closeDatabase = closeDatabase;
exports.getDatabase = getDatabase;
const mongodb_1 = require("mongodb");
const indexes_1 = require("./indexes");
const uri = 'mongodb://localhost:12698';
const dbName = 'sgs';
let client;
let db;
async function connectToDatabase() {
    if (db)
        return db;
    client = new mongodb_1.MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log('Successfully connected to MongoDB');
    await (0, indexes_1.initializeIndexes)(db);
    return db;
}
async function closeDatabase() {
    if (client) {
        await client.close();
    }
}
function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call connectToDatabase first.');
    }
    return db;
}
