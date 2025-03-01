import { inject, injectable } from "inversify";
import { PurchaseRepository } from "../repositories/PurchaseRepository";
import { IPurchase, IPurchaseCreate } from "../models/Purchase";

@injectable()
export class PurchaseService {
  constructor(@inject(PurchaseRepository) private purchaseRepo: PurchaseRepository) {}

  async addPurchase(purchase: IPurchaseCreate): Promise<IPurchase> {
    if (purchase.total <= 0) {
      throw new Error("Invalid purchase data");
    }
    return await this.purchaseRepo.create(purchase);
  }

  async getUserPurchases(userId: string): Promise<IPurchase[]> {
    return await this.purchaseRepo.findByUser(userId);
  }

  async getTotalSpent(userId: string, month: number, year: number): Promise<number> {
    return await this.purchaseRepo.getTotalSpent(userId, month, year);
  }
}
