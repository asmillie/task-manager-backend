import { Document } from 'mongoose';

export interface User extends Document {
    // readonly name: string;
    // readonly password: string;
    // readonly email: string;
    // readonly avatar: Buffer;
    readonly auth0Id: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
