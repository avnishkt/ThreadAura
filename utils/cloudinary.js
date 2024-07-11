const cloudinary = require('cloudinary');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables from .env file
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath.path, {
            resource_type: 'auto'
        });
        console.log(response);

        // Delete local file after uploading
        fs.unlink(localFilePath.path, (err) => {
            if (err) {
                console.error("Error deleting local file:", err);
            } else {
                console.log("Local file deleted successfully.");
            }
        });

        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath.path);
        console.error("Error uploading image to Cloudinary:", error);
        return null;
    }
};

module.exports=uploadCloudinary;