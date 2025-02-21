import { Schema, model, Document } from "mongoose";

export interface IPurchase extends Document {
  userId: string;
  description: string;
  amount: number;
  date: Date;
  category?: string;
  receiptImage?: string;
}

const PurchaseSchema = new Schema<IPurchase>({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  category: { type: String },
  receiptImage: { type: String },
});

export const PurchaseModel = model<IPurchase>("Purchase", PurchaseSchema);
