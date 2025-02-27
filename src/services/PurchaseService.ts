import { inject, injectable } from "inversify";
import { PurchaseRepository } from "../repositories/PurchaseRepository";
import { IPurchase, IPurchaseCreate } from "../models/Purchase";
import { OcrService } from "./OcrService";

@injectable()
export class PurchaseService {
  constructor(
    @inject(PurchaseRepository) private purchaseRepo: PurchaseRepository,
    @inject(OcrService) private ocrService: OcrService,
  ) {}

  async addPurchaseFromImage(userId: string, base64Image: string): Promise<IPurchase | null> {
    const ocrText = await this.ocrService.extractTextFromImage(base64Image);

    console.log(">> oque veio da ocr", ocrText);

    const purchaseData = this.ocrService.parseReceiptText(ocrText);

    purchaseData.userId = userId;

    console.log(">> foi tratado: ", purchaseData);
    if (!purchaseData.total) {
      throw new Error("Não foi possível identificar os dados da compra.");
    }

    return await this.purchaseRepo.create(purchaseData as IPurchaseCreate);
  }

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
