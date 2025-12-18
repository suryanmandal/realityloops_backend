import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IStaff } from "../types/interfaces";
import { UserRole, AccountStatus, StaffRole } from "../types/enums";

const staffSchema: Schema<IStaff> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
      index: true,
    },
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: [UserRole.STAFF],
      default: UserRole.STAFF,
      immutable: true,
    },
    staffRole: {
      type: String,
      enum: Object.values(StaffRole),
      required: [true, "Staff role is required"],
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant ID is required"],
      index: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Added by is required"],
    },
    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.ACTIVE,
    },
    isEmailVerified: {
      type: Boolean,
      default: true, // Staff accounts are pre-verified
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
staffSchema.index({ restaurantId: 1, email: 1 });

// Hash password before saving
staffSchema.pre<IStaff>("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    return next(err);
  }
});

// Compare password method
staffSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const staff = await mongoose
    .model("Staff")
    .findById(this._id)
    .select("+password")
    .exec();

  if (!staff || !staff.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, staff.password);
};

export default mongoose.model<IStaff>("Staff", staffSchema);
