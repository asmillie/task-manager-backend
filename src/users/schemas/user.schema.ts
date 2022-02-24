import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    email: {        
        unique: true,
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
