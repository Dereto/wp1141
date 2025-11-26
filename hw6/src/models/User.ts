import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  lineUserId: string;
  displayName?: string;
  pictureUrl?: string;
  statusMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    lineUserId: { type: String, required: true, unique: true },
    displayName: { type: String },
    pictureUrl: { type: String },
    statusMessage: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

