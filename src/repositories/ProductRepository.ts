import { injectable } from "inversify";
import { ProductModel, IProduct } from "../models/Product";

@injectable()
export class ProductRepository {
  async create(product: IProduct): Promise<IProduct> {
    return await ProductModel.create(product);
  }

  async findByUser(userId: string): Promise<IProduct[]> {
    return await ProductModel.find({ userId }).sort({ expirationDate: 1 }).exec();
  }

  async updateQuantity(userId: string, productName: string, quantity: number): Promise<IProduct | null> {
    return await ProductModel.findOneAndUpdate(
      { userId, name: productName },
      { $inc: { quantity } },
      { new: true }
    );
  }
}
