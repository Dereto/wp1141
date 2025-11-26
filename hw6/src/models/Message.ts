import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  lineUserId: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema(
  {
    lineUserId: { type: String, required: true, index: true },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);

