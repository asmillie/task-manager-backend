import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    auth0: {
        id: {
            unique: true,
            type: String,
            trim: true
        }        
    },
    email: {        
        unique: true,
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
