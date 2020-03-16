import { Document } from 'mongoose';
import { Token } from './token.interface';

export interface User extends Document {
    readonly name: string;
    readonly password: string;
    readonly email: string;
    readonly emailVerified: boolean;
    readonly avatar: Buffer;
    readonly tokens: Token[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
