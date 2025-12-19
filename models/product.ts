import mongoose, { Schema } from "mongoose";
import { IProduct } from "../types/interfaces";
import { ProductStatus } from "../types/enums";

const productSchema: Schema<IProduct> = new Schema(
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
      type: String, // Path to product image
    },
    arModelPath: {
      type: String, // Path to AR model file (e.g., .glb, .gltf)
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category ID is required"],
      index: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant ID is required"],
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
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number, // in minutes
      default: 15,
      min: [0, "Preparation time cannot be negative"],
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for efficient querying
productSchema.index({ restaurantId: 1, categoryId: 1 });
productSchema.index({ restaurantId: 1, status: 1 });
productSchema.index({ title: "text", description: "text" }); // Text search

export default mongoose.model<IProduct>("Product", productSchema);
