import "reflect-metadata";
import { container } from "./infra/Container";
import { Database } from "./infra/Database";

async function main() {
  const db = container.get(Database);
  await db.connect();
  
  console.log("🚀 Bot is ready!");
}

main();
