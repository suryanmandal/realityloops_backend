import mongoose, { Schema } from "mongoose";
import { ICategory } from "../types/interfaces";
import { CategoryStatus } from "../types/enums";

const categorySchema: Schema<ICategory> = new Schema(
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
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant ID is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.index({ restaurantId: 1, name: 1 });

export default mongoose.model<ICategory>("Category", categorySchema);
