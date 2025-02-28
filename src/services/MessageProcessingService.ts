import { injectable } from "inversify";
import { GptProcessor } from "./GptProcessor";
import { GeminiProcessor } from "./GeminiProcessor";

export interface IMessageProcessor {
  processMessage(message: string): Promise<string>;
}

@injectable()
export class MessageProcessingService {
  private userModelMap: Map<string, string>;

  constructor() {
    this.userModelMap = new Map();
  }

  setUserModel(userId: string, model: string) {
    if (model !== "gpt" && model !== "gemini") {
      return `Modelo inválido! Escolha entre "gpt" ou "gemini".`;
    }

    this.userModelMap.set(userId, model);
    return `🤖 Modelo atualizado para ${model.toUpperCase()}!`;
  }

  private getProcessor(userId: string): IMessageProcessor {
    const model = this.userModelMap.get(userId) || "gemini";
    return model === "gemini" ? new GeminiProcessor() : new GptProcessor();
  }

  async processMessage(userId: string, text: string) {
    const processor = this.getProcessor(userId);
    const response = await processor.processMessage(text);
    console.log("[processMessage] userId:", userId, " -> text: ", text, " - response: ", response);

    return response || `🤖 Não entendi. Pode reformular?`;
  }
}
