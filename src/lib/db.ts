import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!
const DB_NAME = process.env.DB_NAME!

// Yeh check karta hai ke connection pehle se exist karta hai ya nahi
// Next.js mein yeh zaroori hai kyunki har API call pe naya connection nahi banana chahiye
declare global {
  var mongoose: {
    conn: mongoose.Connection | null
    promise: Promise<mongoose.Connection> | null
  }
}

// Global variable mein connection store karte hain
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  }
}

const connectDB = async () => {
  // Agar connection pehle se hai toh wahi return karo
  if (cached.conn) {
    console.log("MongoDB already connected!")
    return cached.conn
  }

  // Agar connection nahi hai toh naya banao
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(`${MONGODB_URI}`, {
        dbName: DB_NAME,
      })
      .then((mongoose) => {
        console.log("MongoDB Connected Successfully!")
        return mongoose.connection
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default connectDB