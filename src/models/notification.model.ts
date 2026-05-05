import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  message: string;
  type: "info" | "success" | "warning" | "alert";
  link: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "success", "warning", "alert"], default: "info" },
    link: { type: String, default: "/dashboard" },
    //  FIX: Capital 'B' for Mongoose and default false 
    isRead: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);