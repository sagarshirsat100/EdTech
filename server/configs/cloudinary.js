import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const connectCloudinary = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET_KEY } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_SECRET_KEY) {
    console.error("Cloudinary config error: Missing one or more environment variables:");
    if (!CLOUDINARY_CLOUD_NAME) console.error("- CLOUDINARY_CLOUD_NAME");
    if (!CLOUDINARY_API_KEY) console.error("- CLOUDINARY_API_KEY");
    if (!CLOUDINARY_SECRET_KEY) console.error("- CLOUDINARY_SECRET_KEY");
    throw new Error("Missing Cloudinary environment variables. Check your .env file.");
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_SECRET_KEY,
  });

  console.log("Cloudinary connected successfully.");
};

export default connectCloudinary;