import path from "node:path";

import {
  createTicketId,
  deepClone,
  ensureDir,
  readJson,
  safeNumber,
  writeJson,
} from "../lib/utils.js";

function defaultSession(chatId) {
  return {
    chatId,
    flow: {
      type: "none",
      step: null,
      data: {},
    },
    lastKnownUser: null,
  };
}

export class RuntimeStore {
  constructor(filePath) {
    this.filePath = filePath;
    ensureDir(path.dirname(filePath));
    this.state = readJson(filePath, {
      sessions: {},
      polling: {
        offset: 0,
      },
      counters: {
        ticket: 0,
      },
      tickets: [],
    });
  }

  getSession(chatId) {
    const key = String(chatId);

    if (!this.state.sessions[key]) {
      this.state.sessions[key] = defaultSession(chatId);
      this.flush();
    }

    const current = this.state.sessions[key];
    const normalized = {
      ...defaultSession(chatId),
      ...current,
      flow: {
        ...defaultSession(chatId).flow,
        ...(current.flow || {}),
        data: current.flow?.data || {},
      },
    };

    this.state.sessions[key] = normalized;
    return deepClone(normalized);
  }

  saveSession(session) {
    this.state.sessions[String(session.chatId)] = deepClone(session);
    this.flush();
    return session;
  }

  getOffset() {
    return safeNumber(this.state.polling.offset, 0);
  }

  setOffset(offset) {
    this.state.polling.offset = safeNumber(offset, 0);
    this.flush();
  }

  createTicket(payload) {
    this.state.counters.ticket = safeNumber(this.state.counters.ticket, 0) + 1;

    const ticket = {
      id: createTicketId(this.state.counters.ticket),
      createdAt: new Date().toISOString(),
      ...payload,
    };

    this.state.tickets.unshift(ticket);
    this.flush();
    return deepClone(ticket);
  }

  flush() {
    writeJson(this.filePath, this.state);
  }
}
