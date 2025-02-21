import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  userId: string;
  name: string;
  quantity: number;
  expirationDate?: Date;
  image?: string;
}

const ProductSchema = new Schema<IProduct>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  expirationDate: { type: Date },
  image: { type: String },
});

export const ProductModel = model<IProduct>("Product", ProductSchema);
