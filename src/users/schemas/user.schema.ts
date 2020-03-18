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
        verified: {
            type: Boolean,
            default: false,
        },
        verification: {
            code: {
                type: String,
                trim: true,
            },
            expiry: {
                type: Date,
                trim: true,
            },
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
    }],
}, {
    timestamps: true,
}).method('toJSON', function() {
    // Remove sensitive fields
    const user = this.toObject();
    delete user.password;
    delete user.tokens;
    delete user.avatar;

    return user;
});
