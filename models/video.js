import mongoose from "mongoose";
import mongooseAggregatePagination from 'mongoose-aggregate-paginate-v2';
import { MongoSchemaTypeId } from "../constants";

const VideoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String, // cloudinary url
            required: true
        },
        thumbnail: {
            type: String, // cloudinary url
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number, // cloudinary url
            required: true
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: MongoSchemaTypeId,
            ref: "User"

        }
        
    },
    {
        timestamps: true
    }
);


VideoSchema.plugin(mongooseAggregatePagination);
const VideoModel = mongoose.model("Video", VideoSchema);
export default VideoModel;