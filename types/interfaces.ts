import {
  UserRole,
  StaffRole,
  AccountStatus,
  CategoryStatus,
  ProductStatus,
} from "./enums";
import { Document, Types } from "mongoose";

/**
 * Base user interface with common fields
 */
export interface IBaseUser {
  email: string;
  password: string;
  role: UserRole;
  status: AccountStatus;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Restaurant interface
 */
export interface IRestaurant extends IBaseUser, Document {
  restaurantName: string;
  ownerName: string;
  phone: string;
  address?: string;
  staffMembers?: Types.ObjectId[]; // References to Staff documents
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Admin interface
 */
export interface IAdmin extends IBaseUser, Document {
  name: string;
  phone?: string;
  permissions?: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Staff interface
 */
export interface IStaff extends IBaseUser, Document {
  name: string;
  staffRole: StaffRole;
  restaurantId: Types.ObjectId; // Reference to Restaurant
  phone?: string;
  addedBy: Types.ObjectId; // Reference to Restaurant who added this staff
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * OTP interface
 */
export interface IOTP extends Document {
  email: string;
  otp: string;
  otpType: string;
  expiresAt: Date;
  isUsed: boolean;
  attempts: number;
  createdAt?: Date;
}

/**
 * JWT Payload interface
 */
export interface IJWTPayload {
  id: string;
  email: string;
  role: UserRole;
  staffRole?: StaffRole;
  restaurantId?: string; // For staff members
}

/**
 * Auth Response interface
 */
export interface IAuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: any;
    token?: string;
    refreshToken?: string;
  };
}

export interface ICategory extends Document {
  name: string;
  description?: string;
  image?: string;
  status: CategoryStatus;
  restaurantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct extends Document {
  title: string;
  description: string;
  mrp: number;
  price: number;
  image?: string;
  arModelPath?: string; // Path to AR model file
  categoryId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  status: ProductStatus;
  stock?: number;
  isVegetarian?: boolean;
  isAvailable: boolean;
  preparationTime?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}
