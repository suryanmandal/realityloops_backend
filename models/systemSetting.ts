import mongoose, { Schema, Document } from "mongoose";

export interface ISystemSetting extends Document {
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

const systemSettingSchema: Schema<ISystemSetting> = new Schema(
  {
    key: {
      type: String,
      required: [true, "Key is required"],
      unique: true,
      trim: true,
      index: true,
    },
    value: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISystemSetting>("SystemSetting", systemSettingSchema);
