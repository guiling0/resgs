import { ObjectId } from 'mongodb';

export interface AiRecord {
    _id: ObjectId;

    createdAt: Date;
}
