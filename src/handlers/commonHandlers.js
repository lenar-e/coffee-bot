const { clientMainKeyboard, adminMainKeyboard } = require("../keyboards/replyKeyboards");

const registerCommonHandlers = (bot, { adminId }) => {
  const isAdmin = (ctx) => String(ctx.from.id) === String(adminId);

  bot.start(async (ctx) => {
    if (isAdmin(ctx)) {
      await ctx.reply(
        "Добро пожаловать в админ-панель кофейни.",
        adminMainKeyboard()
      );
      return;
    }

    await ctx.reply("Добро пожаловать в кофейню! Выберите действие:", clientMainKeyboard());
  });

  bot.command("cancel", async (ctx) => {
    if (ctx.scene && ctx.scene.current) {
      await ctx.scene.leave();
      await ctx.reply(
        "Действие отменено.",
        isAdmin(ctx) ? adminMainKeyboard() : clientMainKeyboard()
      );
      return;
    }

    await ctx.reply("Нет активного действия для отмены.");
  });
};

module.exports = {
  registerCommonHandlers
};
