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

const uploadMultipleImages = async (localFilePaths) => {
    const uploadPromises = localFilePaths.map(async (filePath) => {
        return await uploadCloudinary(filePath);
    });

    try {
        const responses = await Promise.all(uploadPromises);
        return responses;
    } catch (error) {
        console.error("Error uploading multiple images to Cloudinary:", error);
        return null;
    }
};

const deleteCloudinaryImage = async (publicId) => {
    try {
        const response = await cloudinary.uploader.destroy(publicId);
        console.log(response);
        return response;
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        return null;
    }
};

const deleteMultipleImages = async (publicIds) => {
    const deletePromises = publicIds.map(async (id) => {
        return await deleteCloudinaryImage(id);
    });

    try {
        const responses = await Promise.all(deletePromises);
        return responses;
    } catch (error) {
        console.error("Error deleting multiple images from Cloudinary:", error);
        return null;
    }
};

module.exports = {
    uploadCloudinary,
    uploadMultipleImages,
    deleteCloudinaryImage,
    deleteMultipleImages
};