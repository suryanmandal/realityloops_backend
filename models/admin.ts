import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IAdmin } from "../types/interfaces";
import { UserRole, AccountStatus } from "../types/enums";

const adminSchema: Schema<IAdmin> = new Schema(
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
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: [UserRole.ADMIN],
      default: UserRole.ADMIN,
      immutable: true,
    },
    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.PENDING_VERIFICATION,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    permissions: [
      {
        type: String,
      },
    ],
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
adminSchema.pre<IAdmin>("save", async function (next) {
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
adminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const admin = await mongoose
    .model("Admin")
    .findById(this._id)
    .select("+password")
    .exec();

  if (!admin || !admin.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, admin.password);
};

export default mongoose.model<IAdmin>("Admin", adminSchema);
