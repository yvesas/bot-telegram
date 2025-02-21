import { Container } from "inversify";
import { Database } from "./Database";
import { PurchaseRepository } from "../repositories/PurchaseRepository";
import { ProductRepository } from "../repositories/ProductRepository";
import { PurchaseService } from "../services/PurchaseService";
import { ProductService } from "../services/ProductService";

const container = new Container();
container.bind<Database>(Database).toSelf();
container.bind<PurchaseRepository>(PurchaseRepository).toSelf();
container.bind<ProductRepository>(ProductRepository).toSelf();
container.bind<PurchaseService>(PurchaseService).toSelf();
container.bind<ProductService>(ProductService).toSelf();

export { container };
