import { Container } from "inversify";
import { Database } from "./Database";
import { PurchaseRepository } from "../repositories/PurchaseRepository";
import { ProductRepository } from "../repositories/ProductRepository";
import { PurchaseService } from "../services/PurchaseService";
import { ProductService } from "../services/ProductService";
import { OcrService } from "../services/OcrService";
import { TelegramBot } from "../services/TelegramBot";

const container = new Container();
container.bind<Database>(Database).toSelf();
container.bind<PurchaseRepository>(PurchaseRepository).toSelf();
container.bind<ProductRepository>(ProductRepository).toSelf();
container.bind<PurchaseService>(PurchaseService).toSelf();
container.bind<ProductService>(ProductService).toSelf();
container.bind<OcrService>(OcrService).toSelf();
container.bind(TelegramBot).toSelf().inSingletonScope();

export { container };
