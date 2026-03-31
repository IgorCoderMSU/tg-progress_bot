function button(text, callbackData) {
  return {
    text,
    callback_data: callbackData,
  };
}

export function mainMenuKeyboard() {
  return {
    inline_keyboard: [
      [button("📄 Specs", "menu:specs")],
      [button("🧾 Invoice", "menu:invoice")],
      [button("🚚 Delivery", "menu:delivery")],
      [button("👤 Manager", "menu:manager")],
    ],
  };
}
