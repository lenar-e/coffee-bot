require("dotenv").config();

const { Telegraf, Scenes, session } = require("telegraf");
const { createCheckoutScene } = require("./handlers/scenes/checkoutScene");
const { createAddProductScene } = require("./handlers/scenes/addProductScene");
const { registerCommonHandlers } = require("./handlers/commonHandlers");
const { registerClientHandlers } = require("./handlers/clientHandlers");
const { registerAdminHandlers } = require("./handlers/adminHandlers");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

if (!BOT_TOKEN || BOT_TOKEN === "token") {
  throw new Error("Укажите валидный BOT_TOKEN в .env");
}

const bot = new Telegraf(BOT_TOKEN);

bot.use(
  session({
    defaultSession: () => ({
      // Корзина хранится в in-memory сессии пользователя.
      cart: []
    })
  })
);

// Stage подключается после session, чтобы сцены могли хранить шаги диалога.
const stage = new Scenes.Stage([
  createCheckoutScene({ adminId: ADMIN_ID }),
  createAddProductScene()
]);

bot.use(stage.middleware());

registerCommonHandlers(bot, { adminId: ADMIN_ID });
registerClientHandlers(bot);
registerAdminHandlers(bot, { adminId: ADMIN_ID });

bot.catch(async (error, ctx) => {
  console.error("Ошибка бота:", error);
  try {
    await ctx.reply("Произошла ошибка. Попробуйте еще раз.");
  } catch (replyError) {
    console.error("Не удалось отправить сообщение об ошибке:", replyError);
  }
});

bot.launch().then(() => {
  console.log("Coffee bot started");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
