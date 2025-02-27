import { Telegraf, Context } from "telegraf";
import type { Message } from "telegraf/types";
import { OcrService } from "./OcrService";

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  throw new Error("Bot access token not found. Check TELEGRAM TOKEN environment variable.");
}

export class TelegramBot {
  private bot: Telegraf;
  private ocrService: OcrService;

  constructor() {
    this.bot = new Telegraf(token || "");
    this.ocrService = new OcrService();
    this.setUpBot();
  }

  private setUpBot() {
    this.bot.start((ctx: Context) => this.handleStart(ctx));
    this.bot.on("text", (ctx: Context) => this.handleText(ctx));
    this.bot.on("photo", (ctx: Context) => this.handlePhoto(ctx));

    this.bot.launch().then(() => {
      console.log("🚀 Bot was launched!");
    });
  }

  private handleStart(ctx: Context) {
    ctx.reply("Olá! Envie uma foto de um cupom fiscal para fazer OCR!");
  }

  private async handleText(ctx: Context) {
    const message = ctx.message as Message.TextMessage;
    if (message?.text) {
      await ctx.reply(`Você disse: ${message.text}`);
    }
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

      const text = await this.ocrService.extractTextFromImage(base64Image);
      await ctx.reply(`Texto extraído: ${text}`);
    } catch (error) {
      console.error("Erro ao baixar/processar a imagem:", error);
      await ctx.reply("Houve um erro ao processar a imagem. Tente novamente.");
    }
  }

  private isPhotoMessage(message: Message | undefined): message is Message.PhotoMessage {
    return !!message && "photo" in message;
  }
}
