import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import * as argon2 from 'argon2';
import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET, MongoSchemaTypeId, REFRESH_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET } from '../constants.js';

const UserSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            trim: true,
            index: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: MongoSchemaTypeId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

// hash password before saving in db
UserSchema.pre("save", async function (next) {
    // check if password is modified in the database, without using isModified function when user changes something in database the pre hook will run for every change and hashes password on every function call this will cause password modification problems because password gets change everytime
    if (!this.isModified("password")) next();
    this.password = await argon2.hash(this.password);
});


// verify password
UserSchema.methods.isPasswordCorrect = async function (password) {
    return await argon2.verify(this.password, password);
};


// generate access token
UserSchema.methods.generateAccessToken = function () {
    const payload = {
        id: this._id,
        username: this.username,
        email: this.email,
        fullName: this.fullName,
    }
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

// generate refresh token
UserSchema.methods.generateRefreshToken = function () {
    const payload = {
        id: this.password,
    }
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;