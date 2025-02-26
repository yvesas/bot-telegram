import { Telegraf, Context } from "telegraf";
import type { Message, Update } from "telegraf/types";

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  throw new Error("Bot access token not found. Check TELEGRAM TOKEN environment variable.");
}

export class TelegramBot {
  private bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(token || "");
    this.setUpBot();
  }

  private setUpBot() {
    this.bot.start((ctx: Context) => this.handleStart(ctx));
    this.bot.on("text", (ctx: Context) => this.handleText(ctx));

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
}
