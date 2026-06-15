import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IBaseUser } from "../types/interfaces";
import { UserRole, AccountStatus } from "../types/enums";

export interface IFurnitureStore extends IBaseUser, mongoose.Document {
  storeName: string;
  ownerName: string;
  phone: string;
  address?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const furnitureStoreSchema: Schema<IFurnitureStore> = new Schema(
  {
    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      index: true,
    },
    ownerName: {
      type: String,
      required: [true, "Owner name is required"],
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
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    address: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: [UserRole.RESTAURANT], // For base user compatibility
      default: UserRole.RESTAURANT,
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
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
furnitureStoreSchema.pre<IFurnitureStore>("save", async function (next) {
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
furnitureStoreSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const store = await mongoose
    .model("FurnitureStore")
    .findById(this._id)
    .select("+password")
    .exec();

  if (!store || !store.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, store.password);
};

export default mongoose.model<IFurnitureStore>("FurnitureStore", furnitureStoreSchema);
