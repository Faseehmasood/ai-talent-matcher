import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (buffer: Buffer, filename: string) => {
  try {
    // Extension saaf karo taake .pdf.pdf na banay 
    const cleanFileName = filename.split('.').slice(0, -1).join('.') || filename;

    const response = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto", // PDF ke liye Cloudinary khud best settings chunay ga
          folder: "recruitment",
          public_id: `${Date.now()}-${cleanFileName.replace(/\s+/g, '_')}`, 
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return (response as any).secure_url; // Direct HTTPS URL
  } catch (error) {
    return null;
  }
};