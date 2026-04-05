import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

// Cloudinary configure karo — .env se values lo
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

// File upload karne ka function
const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    // Agar file path nahi hai toh null return karo
    if (!localFilePath) return null

    // Cloudinary pe upload karo
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Image, PDF, sab handle karega
    })

    // Upload successful — local file delete karo
    fs.unlinkSync(localFilePath)

    return response // response.secure_url mein file ka URL hoga

  } catch (error) {
    // Upload fail hua — phir bhi local file delete karo
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath)
    }
    return null
  }
}

export { uploadOnCloudinary }