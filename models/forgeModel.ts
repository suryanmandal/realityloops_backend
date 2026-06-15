import mongoose, { Schema, Document } from "mongoose";

export interface IForgeModel extends Document {
  shortId: string;
  title: string;
  imageUrl: string;
  glbUrl: string;
  placementMode: "auto" | "hit-test";
  cppLogs: string;
  createdAt: Date;
  updatedAt: Date;
}

const forgeModelSchema: Schema<IForgeModel> = new Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    glbUrl: {
      type: String,
      required: true,
    },
    placementMode: {
      type: String,
      enum: ["auto", "hit-test"],
      default: "auto",
    },
    cppLogs: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IForgeModel>("ForgeModel", forgeModelSchema);
