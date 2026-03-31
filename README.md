# Public Telegram Bot Starter

This folder is a **safe public package** for GitHub.

It is **not** a full copy of the production bot. Private catalog data, internal matching logic, supplier integrations, prompts, logs, and runtime state are intentionally excluded.

## What is included

- a minimal long-polling Telegram bot on Node.js
- inline menu buttons
- a simple manager handoff flow
- local runtime state storage
- a clean `.env.example`
- a publishing checklist

## What is intentionally not included

- real product catalog data
- supplier parsers and document enrichment
- recommendation logic for kits, standards, or regulations
- business-specific text and internal sales logic
- any API keys, chat ids, tokens, or private exports

## Quick start

Requirements:

- Node.js 18+

Setup:

```powershell
cd GITHUB
Copy-Item .env.example .env
```

Fill `.env` with your own values:

- `TELEGRAM_BOT_TOKEN`
- `LEAD_RECIPIENT_CHAT_ID`
- `BOT_USERNAME`

Run:

```powershell
npm start
```

## Project structure

```text
GITHUB/
  .env.example
  .gitignore
  package.json
  README.md
  SECURITY_CHECKLIST.md
  data/
    .gitkeep
  src/
    index.js
    bot.js
    lib/
      env.js
      telegram-api.js
      utils.js
    storage/
      runtime-store.js
    ui/
      keyboards.js
```

## What this starter does

- `/start` shows a simple menu
- the bot can answer button clicks
- the user can leave a short request for a manager
- the manager receives a structured Telegram message

## Safe publishing rules

Before uploading anything public, read [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md).

The key rule is simple:

**Upload only the contents of this `GITHUB` folder, not the root project.**

## Notes

This public starter is suitable if you want to:

- show repository structure
- publish a clean Telegram bot skeleton
- share a hiring/demo version
- avoid leaking private commercial logic

If you want to publish the real production bot, use a **private repository**.
