import { injectable } from "inversify";
import { PurchaseModel, IPurchase } from "../models/Purchase";

@injectable()
export class PurchaseRepository {
  async create(purchase: IPurchase): Promise<IPurchase> {
    return await PurchaseModel.create(purchase);
  }

  async findByUser(userId: string): Promise<IPurchase[]> {
    return await PurchaseModel.find({ userId }).sort({ date: -1 }).exec();
  }

  async getTotalSpent(userId: string, month: number, year: number): Promise<number> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    
    const purchases = await PurchaseModel.find({ userId, date: { $gte: start, $lt: end } });
    return purchases.reduce((total, p) => total + p.amount, 0);
  }
}
