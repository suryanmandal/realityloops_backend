import mongoose, { Schema } from "mongoose";
import { IOTP } from "../types/interfaces";
import { OTPType } from "../types/enums";

const otpSchema: Schema<IOTP> = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: [true, "OTP is required"],
    },
    otpType: {
      type: String,
      enum: Object.values(OTPType),
      required: [true, "OTP type is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry time is required"],
      index: { expires: 0 }, // TTL index - document will be automatically deleted after expiresAt
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
otpSchema.index({ email: 1, otpType: 1, isUsed: 1 });

export default mongoose.model<IOTP>("OTP", otpSchema);
