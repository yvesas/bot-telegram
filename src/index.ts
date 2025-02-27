import "reflect-metadata";
import { container } from "./infra/Container";
import { Database } from "./infra/Database";
import { TelegramBot } from "./services/TelegramBot";

async function main() {
  // Conectar ao banco de dados
  const db = container.get(Database);
  await db.connect();

  // Inicializar o bot
  const telegramBot = container.get(TelegramBot);

  console.log("🚀 Bot is ready!");
}

main();
