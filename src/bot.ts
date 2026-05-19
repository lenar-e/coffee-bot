import dotenv from "dotenv";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Scenes, session, Telegraf } from "telegraf";
import { registerAdminHandlers } from "./handlers/adminHandlers";
import { registerClientHandlers } from "./handlers/clientHandlers";
import { registerCommonHandlers } from "./handlers/commonHandlers";
import { createAddProductScene } from "./handlers/scenes/addProductScene";
import { createCheckoutScene } from "./handlers/scenes/checkoutScene";
import { AppSession, BotContext } from "./types";

dotenv.config({ override: true });

const BOT_TOKEN = process.env.BOT_TOKEN?.trim();
const ADMIN_ID = process.env.ADMIN_ID;
const HTTPS_PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

if (!BOT_TOKEN || BOT_TOKEN.toLowerCase() === "token") {
  throw new Error("Укажите валидный BOT_TOKEN в .env");
}

const bot = new Telegraf<BotContext>(BOT_TOKEN, {
  telegram: HTTPS_PROXY
    ? {
        // Проксируем запросы к Telegram API при блокировках/таймаутах по сети.
        agent: new HttpsProxyAgent(HTTPS_PROXY)
      }
    : undefined
});
let isStopping = false;

bot.use(
  session({
    defaultSession: (): AppSession => ({
      // Корзина хранится в in-memory сессии пользователя.
      cart: []
    })
  }) as never
);

// Stage подключается после session, чтобы сцены могли хранить шаги диалога.
const stage = new Scenes.Stage<any>([
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

const isRetryableLaunchError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return /ETIMEDOUT|ECONNRESET|ENOTFOUND|EAI_AGAIN/i.test(message);
};

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const launchWithRetry = async (): Promise<void> => {
  let attempt = 1;

  while (!isStopping) {
    try {
      await bot.launch();
      console.log("Coffee bot started");
      return;
    } catch (error) {
      if (!isRetryableLaunchError(error) || isStopping) {
        throw error;
      }

      const waitMs = Math.min(30000, attempt * 5000);
      console.error(
        `Сетевая ошибка запуска бота (попытка ${attempt}). Повтор через ${
          waitMs / 1000
        } сек...`,
        error
      );
      attempt += 1;
      await delay(waitMs);
    }
  }
};

launchWithRetry().catch((error) => {
  console.error("Фатальная ошибка запуска бота:", error);
  process.exit(1);
});

process.once("SIGINT", () => {
  isStopping = true;
  bot.stop("SIGINT");
});
process.once("SIGTERM", () => {
  isStopping = true;
  bot.stop("SIGTERM");
});
