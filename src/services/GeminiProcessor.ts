/* eslint-disable @typescript-eslint/no-explicit-any */
import { VertexAI } from "@google-cloud/vertexai";
import { IMessageProcessor } from "./MessageProcessingService";

export class GeminiProcessor implements IMessageProcessor {
  private vertexAI: VertexAI;
  private projectId: string;
  private location: string;
  private modelName: string;
  private model: any;

  constructor() {
    this.projectId = process.env.GCP_PROJECT_ID || "";
    this.location = "us-central1";
    this.modelName = "gemini-2.0-flash-lite-001";

    this.vertexAI = new VertexAI({ project: this.projectId, location: this.location });
    this.model = this.vertexAI.getGenerativeModel({
      model: this.modelName,
    });
  }

  async processMessage(message: string) {
    const prompt = `Extract item, quantity, price, and description from this message: "${message}"`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.candidates[0].content.parts[0].text;

    return text;
  }
}
