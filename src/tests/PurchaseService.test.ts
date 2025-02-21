import "reflect-metadata";
import { PurchaseService } from "../services/PurchaseService";
import { PurchaseRepository } from "../repositories/PurchaseRepository";
import { IPurchase } from "../models/Purchase";
import sinon from "sinon";

describe("PurchaseService", () => {
  let purchaseRepoMock: sinon.SinonStubbedInstance<PurchaseRepository>;
  let purchaseService: PurchaseService;

  beforeEach(() => {
    purchaseRepoMock = sinon.createStubInstance(PurchaseRepository);
    purchaseService = new PurchaseService(purchaseRepoMock as any);
  });

  it("should add a valid purchase", async () => {
    const purchase: IPurchase = {
      userId: "123",
      description: "Coffee",
      amount: 10,
      date: new Date(),
    };

    purchaseRepoMock.create.resolves(purchase);

    const result = await purchaseService.addPurchase(purchase);
    expect(result).toEqual(purchase);
    expect(purchaseRepoMock.create.calledOnce).toBeTruthy();
  });

  it("should throw an error when purchase data is invalid", async () => {
    const purchase: Partial<IPurchase> = {
      userId: "123",
      description: "",
      amount: -10,
    };

    await expect(purchaseService.addPurchase(purchase as IPurchase)).rejects.toThrow("Invalid purchase data");
  });
});
