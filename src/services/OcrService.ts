import { ImageAnnotatorClient } from "@google-cloud/vision";
import dotenv from "dotenv";
import { IPurchaseCreate, IPurchaseItem } from "../models/Purchase";
dotenv.config();

export class OcrService {
  private client: ImageAnnotatorClient;

  constructor() {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error(
        "GOOGLE_APPLICATION_CREDENTIALS not set. Please configure your environment variable.",
      );
    }

    this.client = new ImageAnnotatorClient({ fallback: true });
  }

  public async extractTextFromImage(base64Image: string): Promise<string> {
    try {
      const [result] = await this.client.textDetection({
        image: { content: base64Image },
      });

      const detections = result.textAnnotations;

      if (detections && detections.length > 0) {
        return detections[0].description || "Nenhum texto detectado.";
      } else {
        return "Nenhum texto encontrado na imagem.";
      }
    } catch (error) {
      console.error("Erro ao processar a imagem:", error);
      return "Erro ao processar a imagem.";
    }
  }

  public parseReceiptText(ocrText: string): Partial<IPurchaseCreate> {
    const purchase: Partial<IPurchaseCreate> = {};

    const firstLineMatch = ocrText.match(/^([^\n]*)/);
    purchase.description = firstLineMatch ? firstLineMatch[1].trim() : "Não informado.";

    purchase.store = { name: "", cnpj: "" };
    const cnpjMatch = ocrText.match(/CNPJ:\s*([\d.,\/]+)/);
    purchase.store.name = firstLineMatch ? firstLineMatch[1].trim() : "Desconhecido";
    purchase.store.cnpj = cnpjMatch ? cnpjMatch[1].trim() : "000000000000";

    const dateMatch = ocrText.match(/(\d{2}\/\d{2}\/\d{4}) (\d{2}:\d{2}:\d{2})/);
    purchase.date = dateMatch ? new Date(`${dateMatch[1]} ${dateMatch[2]}`) : new Date();

    const totalMatch = ocrText.match(/TOTAL R\$\s*(\d+,\d+)/);
    purchase.total = totalMatch ? parseFloat(totalMatch[1].replace(",", ".")) : 0;

    const items: IPurchaseItem[] = [];
    const itemRegex = /\d{3}\s+([\w\s]+)\n(\d+)\s+UNX(\d+,\d+)/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(ocrText)) !== null) {
      items.push({
        description: itemMatch[1].trim(),
        quantity: parseInt(itemMatch[2], 10),
        unitPrice: parseFloat(itemMatch[3].replace(",", ".")),
        total: parseFloat(itemMatch[3].replace(",", ".")),
        category: this.categorizeProduct(itemMatch[1].trim()),
      });
    }

    const taxMatch = ocrText.match(/Trib Aprox R\$:\s*(\d+,\d+)Fed\/(\d+,\d+)Est/);
    const icmsMatch = ocrText.match(/ICMS:\s*(\d+,\d+)/);
    purchase.tax = {
      federal: taxMatch ? parseFloat(taxMatch[1].replace(",", ".")) : 0,
      state: taxMatch ? parseFloat(taxMatch[2].replace(",", ".")) : 0,
      icms: icmsMatch ? parseFloat(icmsMatch[1].replace(",", ".")) : 0,
    };

    return purchase;
  }

  private categorizeProduct(productName: string): string {
    const categories: { [key: string]: string } = {
      "fone de ouvido": "Eletrônicos",
      airbuds: "Eletrônicos",
      tênis: "Vestuário",
      calça: "Vestuário",
      livro: "Livros",
      chocolate: "Alimentação",
    };

    productName = productName.toLowerCase();
    for (const keyword in categories) {
      if (productName.includes(keyword)) {
        return categories[keyword];
      }
    }
    return "Outros";
  }
}
