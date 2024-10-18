import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from '../constants.js';



// Configuration
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});


const fileUploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // upload file
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        });

        fs.unlinkSync(localFilePath);
        return uploadResult;
    } catch (error) {
        console.log(error);
        fs.unlinkSync(localFilePath); // remove file from server if anything goes wrong
    }
};

export { fileUploadCloudinary };