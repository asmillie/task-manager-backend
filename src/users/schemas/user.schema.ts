import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        trim: true,
    },
    email: {
        address: {
            unique: true,
            type: String,
            trim: true,
        },
    },
    avatar: {
        type: Buffer,
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        },
        expiry: {
            type: Date,
            required: true,
        },
    }],
}, {
    timestamps: true,
}).set('toJSON', {
    transform: function(doc, ret, options) {
        // Remove sensitive fields    
        delete ret.password;
        delete ret.tokens;
        delete ret.avatar;
    
        return ret;
    }
});
