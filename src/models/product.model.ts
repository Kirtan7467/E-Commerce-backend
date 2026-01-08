import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  images: string[];
  price: number;
  vendor: mongoose.Types.ObjectId;
  isActive: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "User", // ✅ correct
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
productSchema.index({ title: "text", description: "text" });
productSchema.index({ price: 1, createdAt: -1 });

const Product = mongoose.model<IProduct>("Product", productSchema);
export default Product;
