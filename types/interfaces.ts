import {
  UserRole,
  StaffRole,
  AccountStatus,
  CategoryStatus,
  ProductStatus,
  OrderStatus,
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
  is3dEnabled?: boolean;
  heroImage?: string;
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
  arModelPath?: string; // Public URL to AR model file
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

/**
 * Order Item interface - individual item in an order
 */
export interface IOrderItem {
  productId: Types.ObjectId;
  productName: string; // Snapshot for history
  quantity: number;
  unitPrice: number; // Price at time of order
  subtotal: number; // quantity * unitPrice
}

/**
 * Order interface
 */
export interface IOrder extends Document {
  orderNumber: string; // Unique order number (auto-generated)
  restaurantId: Types.ObjectId; // Reference to Restaurant
  tableNumber: string; // Table identifier (e.g., "T1", "T12", "Counter")

  // Order items
  items: IOrderItem[];

  // Pricing
  totalAmount: number; // Calculated from items
  paymentAmount: number; // Amount to be paid (could include tax/discount in future)

  // Status & Payment
  status: OrderStatus;
  isPaid: boolean;

  // Staff assignments
  waiterStaffId?: Types.ObjectId; // Reference to Staff (waiter who accepted/handled)
  kitchenStaffId?: Types.ObjectId; // Reference to Staff (kitchen who prepared)

  // Timeline tracking
  orderAcceptedAt?: Date; // When waiter accepts the order
  preparingStartedAt?: Date; // When kitchen starts preparing
  preparedAt?: Date; // When kitchen finishes preparing
  deliveredAt?: Date; // When waiter delivers to customer
  paidAt?: Date; // When payment is received

  // Notes
  customerNotes?: string; // Special requests from customer
  kitchenNotes?: string; // Internal notes for kitchen

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

