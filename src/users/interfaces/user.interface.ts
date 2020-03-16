import { Document } from 'mongoose';
import { Token } from './token.interface';

export interface User extends Document {
    readonly name: string;
    readonly password: string;
    readonly email: {
        readonly address: string,
        readonly verified: boolean,
        readonly verification: {
            readonly token: string;
            readonly expiry: Date;
        },
    };
    readonly avatar: Buffer;
    readonly tokens: Token[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
