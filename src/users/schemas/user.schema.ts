import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    email: {        
        unique: true,
        type: String,
        trim: true,
    },
    avatar: {
        type: Buffer,
    },
}, {
    timestamps: true,
}).set('toJSON', {
    transform: function(doc, ret, options) {
        // Remove sensitive fields
        delete ret.avatar;
    
        return ret;
    }
});
