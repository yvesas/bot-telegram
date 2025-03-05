import "reflect-metadata";
import { container } from "./infra/Container";
import { Database } from "./infra/Database";
import { TelegramBot } from "./services/TelegramBot";

async function main() {
  const db = container.get(Database);
  await db.connect();
  container.get(TelegramBot);
  console.log("🚀 Bot is ready!");
}

main();
