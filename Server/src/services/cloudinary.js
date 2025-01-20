// Import cloudinary
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

// Config cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// The file uploads is to be performed in 2 steps:
// 1.Upload file to the server -> Local storage using multer
// 2.Fetch file from Local storage and upload it to cloudinary
// Delete file locally
const uploadFileToCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;

    try {
        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "auto"
            }
        )
    
        console.log("File uploaded on Cloudinary");
        return response;
    } 
    catch (error) {
        // Delete the file from local storage
        fs.unlinkSync(localFilePath);
    }
}

export { uploadFileToCloudinary }