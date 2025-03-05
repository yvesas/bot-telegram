import { Telegraf, Context } from "telegraf";
import type { Message } from "telegraf/types";
import { container } from "../infra/Container";
import { PurchaseService } from "./PurchaseService";
import { OcrService } from "./OcrService";
import { MessageProcessingService } from "./MessageProcessingService";
import { convertModelResponseToPurchase } from "../infra/converters/purchaseConverter";

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  throw new Error("Bot access token not found. Check TELEGRAM TOKEN environment variable.");
}

export class TelegramBot {
  private bot: Telegraf;
  private purchaseService: PurchaseService;
  private ocrService: OcrService;
  private messageProcessingService: MessageProcessingService;

  constructor() {
    this.bot = new Telegraf(token || "");
    this.purchaseService = container.get(PurchaseService);
    this.ocrService = container.get(OcrService);
    this.messageProcessingService = container.get(MessageProcessingService);

    this.setUpBot();
  }
  private setUpBot() {
    this.bot.start((ctx) =>
      ctx.reply("Olá! Envie um cupom fiscal ou use /compras para ver seus gastos."),
    );
    this.bot.command("compras", (ctx) => this.handleGetPurchases(ctx));
    this.bot.command("ia", (ctx) => this.handleSetIAModel(ctx));

    this.bot.on("text", (ctx: Context) => this.handleText(ctx));
    this.bot.on("photo", (ctx: Context) => this.handlePhoto(ctx));
    this.bot.launch().then(() => console.info("🚀 Bot was launched!"));
  }

  private async handleText(ctx: Context) {
    const message = ctx.message as Message.TextMessage;
    const userId = String(ctx.message?.from.id);
    const messageProcessed = await this.messageProcessingService.processMessage(
      userId,
      message.text,
    );
    console.log(">> messageProcessed by text: ", messageProcessed);

    if (messageProcessed.message) {
      await ctx.reply(`❌ ${messageProcessed.message}`);
      await ctx.reply(
        "❌ Não consegui identificar os dados corretamente. Pode repetir por favor com mais detalhes.",
      );
      return;
    }

    const purchaseData = convertModelResponseToPurchase(messageProcessed);
    if (purchaseData) {
      await this.purchaseService.addPurchase(purchaseData);
      await ctx.reply(
        `🛒 Compra registrada: ${purchaseData.description} - Total de R$ ${purchaseData.total.toFixed(2)}`,
      );
    }
  }

  private async handleSetIAModel(ctx: Context) {
    const userId = String(ctx.message?.from.id);
    const model = (ctx.message as Message.TextMessage)?.text.split(" ")[1]?.toLowerCase();

    if (!model) {
      return ctx.reply("Use: /ia gpt ou /ia gemini");
    }

    const response = this.messageProcessingService.setUserModel(userId, model);
    ctx.reply(response);
  }

  private async handleGetPurchases(ctx: Context) {
    const userId = String(ctx.message?.from.id);
    const purchases = await this.purchaseService.getUserPurchases(userId);

    if (purchases.length === 0) {
      await ctx.reply("Você ainda não tem compras registradas.");
      return;
    }

    const message = purchases
      .slice(0, 5)
      .map((p) => `🛒 ${p.description}: R$${p.total.toFixed(2)} em ${p.date.toLocaleDateString()}`)
      .join("\n");

    await ctx.reply(`📋 Suas últimas compras:\n\n${message}`);
  }

  private async handlePhoto(ctx: Context) {
    const { message } = ctx;

    if (!this.isPhotoMessage(message)) {
      await ctx.reply("Envie uma foto para que eu possa processá-la.");
      return;
    }

    const fileId = message.photo[message.photo.length - 1].file_id; // Pega a imagem de melhor resolução
    const file = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

    try {
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString("base64");
      const userId = String(ctx.from?.id);

      const ocrText = await this.ocrService.extractTextFromImage(base64Image);
      const messageProcessed = await this.messageProcessingService.processMessage(userId, ocrText);
      console.log(">> messageProcessed by photo: ", messageProcessed);

      if (messageProcessed.message) {
        await ctx.reply(`❌ ${messageProcessed.message}`);
        await ctx.reply(
          "❌ Não consegui identificar os dados corretamente. Tente uma imagem mais nítida",
        );
        return;
      }

      const purchaseData = convertModelResponseToPurchase(messageProcessed);
      if (purchaseData) {
        await this.purchaseService.addPurchase(purchaseData);
        await ctx.reply(
          `🛒 Compra registrada: ${purchaseData.description} - Total de R$ ${purchaseData.total.toFixed(2)}`,
        );
      }
    } catch (error) {
      console.error("Erro ao baixar/processar a imagem:", error);
      await ctx.reply("Houve um erro ao processar a imagem. Tente novamente.");
    }
  }

  private isPhotoMessage(message: Message | undefined): message is Message.PhotoMessage {
    return !!message && "photo" in message;
  }
}
