import { Readable } from "stream";
import { Telegraf, Context } from "telegraf";
import type { Message } from "telegraf/types";
import { OcrService } from "./OcrService";
import { Buffer } from "buffer";

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
    ctx.reply("Olá! Eu sou o seu bot.");
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

    const fileId = message.photo[0].file_id;

    const file = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

    const response = await fetch(fileUrl);

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const text = await this.ocrService.extractTextFromImage(imageBuffer);

    await ctx.reply(`Texto extraído: ${text}`);
  }

  private isPhotoMessage(message: Message | undefined): message is Message.PhotoMessage {
    return !!message && "photo" in message;
  }
}
