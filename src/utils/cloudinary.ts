import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

// Buffer se directly upload karo
const uploadOnCloudinary = async (
  buffer: Buffer,
  filename: string
): Promise<string | null> => {
  try {
    // Buffer ko base64 mein convert karo
    const base64 = buffer.toString("base64")
    const dataUri = `data:application/pdf;base64,${base64}`

    const response = await cloudinary.uploader.upload(dataUri, {
      resource_type: "auto",
      public_id: `resumes/${Date.now()}-${filename}`,
      folder: "recruitment",
    })

    return response.secure_url // ✅ URL return karo

  } catch (error) {
    console.error("Cloudinary upload error:", error)
    return null
  }
}

export { uploadOnCloudinary }