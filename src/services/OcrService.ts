import { ImageAnnotatorClient } from "@google-cloud/vision";
import dotenv from "dotenv";
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
}
