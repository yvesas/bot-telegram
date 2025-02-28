import { OpenAI } from "openai";
import { IMessageProcessor } from "./MessageProcessingService";

export class GptProcessor implements IMessageProcessor {
  private ai: OpenAI;
  private model: string;

  constructor() {
    this.model = "gpt-4-turbo";
    this.ai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processMessage(message: string) {
    // const prompt = `Extract item, quantity, price, and description from this message: "${message}"`;
    const prompt = `
    Identifique se a frase descreve uma compra. Se sim, extraia os seguintes dados:
    - Item comprado
    - Quantidade (se não informado, assumir 1)
    - Valor total (número sem unidade monetária)
    - Intenção: "purchase" se for uma compra, "other" se não for.

    Exemplos:
    - "agua 78" → { intent: "purchase", item: "agua", amount: 1, price: 78 }
    - "4 galoes agua 78" → { intent: "purchase", item: "galões de agua", amount: 4, price: 78 }
    - "Quanto gastei este mês?" → { intent: "other" }

    Entrada: "${message}"
    Responda apenas com um JSON válido.
    `;

    const completion = await this.ai.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    try {
      return JSON.parse(completion.choices[0].message.content || "");
    } catch (error) {
      console.error("Erro ao processar resposta da IA:", error);
      return { intent: "other" };
    }
  }
}
