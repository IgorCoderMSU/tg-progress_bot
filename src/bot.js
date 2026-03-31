import { extractMessageText, formatUserDisplay, sleep } from "./lib/utils.js";
import { mainMenuKeyboard } from "./ui/keyboards.js";

function emptyFlow() {
  return {
    type: "none",
    step: null,
    data: {},
  };
}

function parseCallback(rawValue = "") {
  const parts = String(rawValue || "").split(":");
  return {
    kind: parts[0] || "",
    value: parts.slice(1).join(":"),
  };
}

export class PublicDemoBot {
  constructor({ api, store, config }) {
    this.api = api;
    this.store = store;
    this.config = config;
    this.running = false;
  }

  async start() {
    this.running = true;

    while (this.running) {
      try {
        const offset = this.store.getOffset() + 1;
        const updates = await this.api.getUpdates(offset, this.config.pollingTimeout);

        for (const update of updates) {
          try {
            await this.handleUpdate(update);
          } catch (error) {
            console.error(`Update handling error for ${update.update_id}:`, error);
          } finally {
            this.store.setOffset(update.update_id);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
        await sleep(3000);
      }
    }
  }

  loadSession(chatId, user) {
    const session = this.store.getSession(chatId);

    if (user) {
      session.lastKnownUser = {
        id: user.id,
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
      };
    }

    return session;
  }

  saveSession(session) {
    this.store.saveSession(session);
  }

  clearFlow(session) {
    session.flow = emptyFlow();
  }

  async reply(chatId, text, extra = {}) {
    return this.api.sendMessage(chatId, text, extra);
  }

  async handleUpdate(update) {
    if (update.callback_query) {
      await this.handleCallbackQuery(update.callback_query);
      return;
    }

    if (update.message) {
      await this.handleMessage(update.message);
    }
  }

  async handleMessage(message) {
    const session = this.loadSession(message.chat.id, message.from);
    const text = extractMessageText(message).trim();

    if (message.text && /^\/start\b/.test(message.text)) {
      this.clearFlow(session);
      this.saveSession(session);
      await this.sendWelcome(message.chat.id);
      return;
    }

    if (message.text && /^\/menu\b/.test(message.text)) {
      this.clearFlow(session);
      this.saveSession(session);
      await this.sendWelcome(message.chat.id);
      return;
    }

    if (session.flow.type === "manager_request") {
      await this.handleManagerFlow(session, message);
      return;
    }

    if (text) {
      await this.sendWelcome(message.chat.id);
      return;
    }
  }

  async handleCallbackQuery(callbackQuery) {
    const session = this.loadSession(callbackQuery.message.chat.id, callbackQuery.from);
    const callback = parseCallback(callbackQuery.data || "");

    try {
      await this.api.answerCallbackQuery(callbackQuery.id);
    } catch (error) {
      console.error("Callback answer error:", error);
    }

    if (callback.kind !== "menu") {
      return;
    }

    if (callback.value === "specs") {
      await this.reply(
        callbackQuery.message.chat.id,
        "This is a public demo. The real product specifications flow is intentionally omitted.",
        { reply_markup: mainMenuKeyboard() },
      );
      return;
    }

    if (callback.value === "invoice") {
      await this.reply(
        callbackQuery.message.chat.id,
        "This is a public demo. The real invoice flow is intentionally omitted.",
        { reply_markup: mainMenuKeyboard() },
      );
      return;
    }

    if (callback.value === "delivery") {
      await this.reply(
        callbackQuery.message.chat.id,
        "This is a public demo. The real delivery flow is intentionally omitted.",
        { reply_markup: mainMenuKeyboard() },
      );
      return;
    }

    if (callback.value === "manager") {
      session.flow = {
        type: "manager_request",
        step: "message",
        data: {},
      };
      this.saveSession(session);

      await this.reply(
        callbackQuery.message.chat.id,
        "Describe your request in one short message. It will be forwarded to the manager chat.",
      );
      return;
    }

    await this.sendWelcome(callbackQuery.message.chat.id);
  }

  async handleManagerFlow(session, message) {
    const text = extractMessageText(message).trim();

    if (!text) {
      await this.reply(message.chat.id, "Please send a text message.");
      return;
    }

    const ticket = this.store.createTicket({
      type: "manager_request",
      chatId: message.chat.id,
      userId: session.lastKnownUser?.id || null,
      payload: {
        text,
      },
    });

    const userLabel = formatUserDisplay(session.lastKnownUser || {});
    await this.api.sendMessage(
      this.config.managerChatId,
      [
        `New Telegram request #${ticket.id}`,
        "",
        `User: ${userLabel}`,
        `User id: ${session.lastKnownUser?.id || "unknown"}`,
        "",
        `Message: ${text}`,
      ].join("\n"),
    );

    this.clearFlow(session);
    this.saveSession(session);

    await this.reply(message.chat.id, "Done. The request was forwarded to the manager.");
  }

  async sendWelcome(chatId) {
    await this.reply(
      chatId,
      [
        "Hello!",
        "This is a safe public demo of a Telegram bot starter.",
        "",
        "Use the buttons below to explore the basic structure.",
      ].join("\n"),
      {
        reply_markup: mainMenuKeyboard(),
      },
    );
  }
}
