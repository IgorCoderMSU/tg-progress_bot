import path from "node:path";
import { fileURLToPath } from "node:url";

import { PublicDemoBot } from "./bot.js";
import { loadEnvFile, requireEnv, envNumber } from "./lib/env.js";
import { TelegramApi } from "./lib/telegram-api.js";
import { RuntimeStore } from "./storage/runtime-store.js";

const currentFilePath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFilePath), "..");

loadEnvFile(rootDir);

const config = {
  botToken: requireEnv("TELEGRAM_BOT_TOKEN"),
  managerChatId: requireEnv("LEAD_RECIPIENT_CHAT_ID"),
  botUsername: process.env.BOT_USERNAME || "your_bot_username",
  pollingTimeout: envNumber("POLLING_TIMEOUT", 25),
  storeFile: path.resolve(rootDir, process.env.STORE_FILE || "./data/runtime-store.json"),
};

const api = new TelegramApi(config.botToken);
const store = new RuntimeStore(config.storeFile);

const bot = new PublicDemoBot({
  api,
  store,
  config,
});

bot.start().catch((error) => {
  console.error("Bot stopped with error:", error);
  process.exitCode = 1;
});
