import { ImageAnnotatorClient } from "@google-cloud/vision";
import { Buffer } from "buffer";

export class OcrService {
  private client: ImageAnnotatorClient;

  constructor() {
    this.client = new ImageAnnotatorClient({ fallback: true });
  }

  public async extractTextFromImage(image: Buffer): Promise<string> {
    try {
      const [result] = await this.client.textDetection(image);
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
}
