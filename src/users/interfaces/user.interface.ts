import { Document } from 'mongoose';

export interface User extends Document {
    readonly name: string;
    readonly password: string;
    readonly email: string;
    readonly age: number;
    readonly avatar: Buffer;
    readonly tokens: [{
        readonly token: string;
    }];
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
