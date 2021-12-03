import { Document } from 'mongoose';

export interface User extends Document {
    readonly auth0: {
        readonly id: String;
        readonly lastSyncedAt?: Date;
    };
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
