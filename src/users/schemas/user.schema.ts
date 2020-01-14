import * as mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

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
        unique: true,
        type: String,
        trim: true,
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
    const user = this.toObject();
    delete user.password;
    delete user.tokens;

    return user;
});

// // Collection relationships
// UserSchema.virtual('tasks', {
//     ref: 'Task',
//     localField: '_id',
//     foreignField: 'owner',
// });

// // Generate Authentication Token for User
// userSchema.method('generateAuthToken', async function() {
//     const user = this;
//     const payload = { _id: user.id.toString() };

//     let newToken;
//     await jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
//         if (err) {
//             throw new Error('Unable to authorize user');
//         } else {
//             newToken = token.toString();
//             user.tokens = user.tokens.concat([{ token: newToken }]);
//         }
//     });

//     await user.save();

//     return newToken;
// });



// // Find user by email and validate password
// userSchema.statics.findByCredentials = async (email, password) => {

//     let user;
//     await User.findOne({ email }, (err, userDoc) => {
//         if (err) {
//             throw new Error('Unable to login');
//         } else {
//             user = userDoc;
//         }
//     });

//     await bcrypt.compare(password, user.password, (err, res) => {
//         if (err) {
//             throw new Error('Unable to login');
//         }
//     });

//     return user;
// };

// // Hash user password before save
// userSchema.pre('save', async function(next) {
//     const user = this;

//     if (user.isModified('password')) {
//         user.password = await bcrypt.hash(user.password, 8);
//     }

//     next();
// });

// // Cascade deletion of user-owned tasks
// userSchema.pre('remove', async function(next) {
//     const user = this;

//     const conditions = { owner: user._id };
//     await Task.deleteMany(conditions);

//     next();
// });

// export const User = mongoose.model('User', userSchema);
