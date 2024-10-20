import mongoose from "mongoose";
export const DB_NAME = process.env.DB_NAME;
export const PORT = process.env.PORT || 8000;
export const DB_URI = process.env.MONGO_URI;
export const CORS_ORIGIN = process.env.CORS_ORIGIN;
export const MongoSchemaTypeId = mongoose.Schema.Types.ObjectId;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;