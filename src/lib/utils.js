import fs from "node:fs";
import path from "node:path";

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function readJson(filePath, fallbackValue) {
  if (!fs.existsSync(filePath)) {
    return deepClone(fallbackValue);
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch {
    return deepClone(fallbackValue);
  }
}

export function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function createTicketId(counter, date = new Date()) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `TG-${year}${month}${day}-${String(counter).padStart(4, "0")}`;
}

export function extractMessageText(message = {}) {
  return message.text || message.caption || "";
}

export function formatUserDisplay(user = {}) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();

  if (user.username) {
    return `@${user.username}${fullName ? ` (${fullName})` : ""}`;
  }

  return fullName || `id ${user.id ?? "unknown"}`;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
