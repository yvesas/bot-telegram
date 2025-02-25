import "reflect-metadata";
import { PurchaseService } from "../services/PurchaseService";
import { PurchaseRepository } from "../repositories/PurchaseRepository";
import { IPurchase, IPurchaseCreate, PurchaseModel } from "../models/Purchase";
import sinon from "sinon";

describe("PurchaseService", () => {
  let purchaseRepoMock: sinon.SinonStubbedInstance<PurchaseRepository>;
  let purchaseService: PurchaseService;

  beforeEach(() => {
    purchaseRepoMock = sinon.createStubInstance(PurchaseRepository);
    purchaseService = new PurchaseService(purchaseRepoMock);
  });

  it("should add a valid purchase", async () => {
    const purchase: IPurchaseCreate = {
      userId: "123",
      description: "Coffee",
      amount: 10,
      date: new Date(),
    };
    const purchaseMock = new PurchaseModel({
      ...purchase,
      _id: "mocked_id",
    }) as IPurchase;

    purchaseRepoMock.create.resolves(purchaseMock);

    const result = await purchaseService.addPurchase(purchase);
    expect(result).toEqual(purchaseMock);
    expect(purchaseRepoMock.create.calledOnce).toBeTruthy();
  });

  it("should throw an error when purchase data is invalid", async () => {
    const purchase: Partial<IPurchase> = {
      userId: "123",
      description: "",
      amount: -10,
    };

    await expect(purchaseService.addPurchase(purchase as IPurchase)).rejects.toThrow(
      "Invalid purchase data",
    );
  });
});
