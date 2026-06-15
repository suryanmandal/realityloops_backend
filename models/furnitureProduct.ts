import mongoose, { Schema } from "mongoose";
import { ProductStatus } from "../types/enums";

export interface IFurnitureProduct extends mongoose.Document {
  title: string;
  description: string;
  mrp: number;
  price: number;
  image?: string;
  arModelPath?: string;
  categoryId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  status: ProductStatus;
  stock?: number;
  isAvailable: boolean;
  dimensions?: {
    height?: string;
    width?: string;
    depth?: string;
  };
  material?: string;
  createdAt: Date;
  updatedAt: Date;
}

const furnitureProductSchema: Schema<IFurnitureProduct> = new Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    mrp: {
      type: Number,
      required: [true, "MRP is required"],
      min: [0, "MRP cannot be negative"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
    },
    arModelPath: {
      type: String,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "FurnitureCategory",
      required: [true, "Category ID is required"],
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "FurnitureStore",
      required: [true, "Store ID is required"],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.ACTIVE,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    dimensions: {
      height: { type: String, trim: true },
      width: { type: String, trim: true },
      depth: { type: String, trim: true },
    },
    material: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
furnitureProductSchema.index({ storeId: 1, categoryId: 1 });
furnitureProductSchema.index({ storeId: 1, status: 1 });
furnitureProductSchema.index({ title: "text", description: "text" });

export default mongoose.model<IFurnitureProduct>("FurnitureProduct", furnitureProductSchema);
