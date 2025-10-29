import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (filepath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    if (!filepath) throw new Error("No file path provided to Cloudinary");

    const uploadResult = await cloudinary.uploader.upload(filepath);
    fs.unlinkSync(filepath); // delete file from local storage after upload
    return uploadResult.secure_url; // return Cloudinary image URL
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error.message);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    throw error;
  }
};

export default uploadOnCloudinary;
