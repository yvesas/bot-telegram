import { Schema, model, Document } from "mongoose";

export interface IPurchaseBase {
  userId: string;
  description: string;
  amount: number;
  date: Date;
  category?: string;
  receiptImage?: string;
}

export type IPurchaseCreate = Omit<IPurchaseBase, "_id">;

export interface IPurchase extends IPurchaseBase, Document {}

const PurchaseSchema = new Schema<IPurchase>(
  {
    userId: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    category: { type: String },
    receiptImage: { type: String },
  },
  {
    timestamps: true,
  },
);

export const PurchaseModel = model<IPurchase>("Purchase", PurchaseSchema);
