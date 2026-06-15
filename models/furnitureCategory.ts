import mongoose, { Schema } from "mongoose";
import { CategoryStatus } from "../types/enums";

export interface IFurnitureCategory extends mongoose.Document {
  name: string;
  description?: string;
  image?: string;
  status: CategoryStatus;
  storeId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const furnitureCategorySchema: Schema<IFurnitureCategory> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(CategoryStatus),
      default: CategoryStatus.ACTIVE,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "FurnitureStore",
      required: [true, "Furniture Store ID is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

furnitureCategorySchema.index({ storeId: 1, name: 1 });

export default mongoose.model<IFurnitureCategory>("FurnitureCategory", furnitureCategorySchema);
