import { Telegraf } from "telegraf";
import { adminOrderButtons, adminProductButtons } from "../keyboards/inlineKeyboards";
import { adminMainKeyboard } from "../keyboards/replyKeyboards";
import { formatOrderForAdmin, getAllOrders, getOrderById, updateOrderStatus } from "../services/orderService";
import { deleteProduct, getAllProducts, toggleProductAvailability } from "../services/productService";
import { BotContext } from "../types";
import { SCENE_ID as ADD_PRODUCT_SCENE_ID } from "./scenes/addProductScene";

const createAdminGuard = (adminId?: string) => (ctx: BotContext): boolean =>
  String(ctx.from?.id) === String(adminId);

export const registerAdminHandlers = (
  bot: Telegraf<BotContext>,
  { adminId }: { adminId?: string }
): void => {
  const isAdmin = createAdminGuard(adminId);

  bot.hears("Товары", async (ctx) => {
    if (!isAdmin(ctx)) {
      return;
    }

    const products = getAllProducts();
    if (!products.length) {
      await ctx.reply("Список товаров пуст.");
      return;
    }

    for (const product of products) {
      await ctx.reply(
        `#${product.id} ${product.name}\nКатегория: ${product.category}\nЦена: ${
          product.price
        } ₽\nНаличие: ${product.available ? "Да" : "Нет"}`,
        adminProductButtons(product)
      );
    }
  });

  bot.hears("Добавить товар", async (ctx) => {
    if (!isAdmin(ctx)) {
      return;
    }

    await ctx.scene.enter(ADD_PRODUCT_SCENE_ID);
  });

  bot.hears("Заказы", async (ctx) => {
    if (!isAdmin(ctx)) {
      return;
    }

    const orders = getAllOrders();
    if (!orders.length) {
      await ctx.reply("Заказов пока нет.");
      return;
    }

    for (const order of orders) {
      if (order.status === "pending") {
        await ctx.reply(formatOrderForAdmin(order), adminOrderButtons(order.id));
      } else {
        await ctx.reply(formatOrderForAdmin(order));
      }
    }
  });

  bot.action(/^toggle_product_(\d+)$/, async (ctx) => {
    if (!isAdmin(ctx)) {
      await ctx.answerCbQuery("Нет доступа", { show_alert: true });
      return;
    }

    const productId = Number(ctx.match[1]);
    const product = toggleProductAvailability(productId);

    if (!product) {
      await ctx.answerCbQuery("Товар не найден", { show_alert: true });
      return;
    }

    await ctx.answerCbQuery("Наличие обновлено");
    await ctx.reply(
      `Товар ${product.name}: ${product.available ? "доступен" : "недоступен"}`,
      adminMainKeyboard()
    );
  });

  bot.action(/^delete_product_(\d+)$/, async (ctx) => {
    if (!isAdmin(ctx)) {
      await ctx.answerCbQuery("Нет доступа", { show_alert: true });
      return;
    }

    const productId = Number(ctx.match[1]);
    const deleted = deleteProduct(productId);

    if (!deleted) {
      await ctx.answerCbQuery("Товар не найден", { show_alert: true });
      return;
    }

    await ctx.answerCbQuery("Товар удален");
    await ctx.reply("Товар удален.", adminMainKeyboard());
  });

  bot.action(/^order_accept_(\d+)$/, async (ctx) => {
    if (!isAdmin(ctx)) {
      await ctx.answerCbQuery("Нет доступа", { show_alert: true });
      return;
    }

    const orderId = Number(ctx.match[1]);
    const order = getOrderById(orderId);
    if (!order) {
      await ctx.answerCbQuery("Заказ не найден", { show_alert: true });
      return;
    }

    updateOrderStatus(orderId, "accepted");
    await ctx.answerCbQuery("Заказ принят");
    await ctx.reply(`Статус заказа #${orderId}: accepted`, adminMainKeyboard());

    try {
      await ctx.telegram.sendMessage(
        order.userId,
        `Ваш заказ #${orderId} принят и готовится.`
      );
    } catch (error) {
      console.error("Не удалось отправить уведомление клиенту:", error);
    }
  });

  bot.action(/^order_reject_(\d+)$/, async (ctx) => {
    if (!isAdmin(ctx)) {
      await ctx.answerCbQuery("Нет доступа", { show_alert: true });
      return;
    }

    const orderId = Number(ctx.match[1]);
    const order = getOrderById(orderId);
    if (!order) {
      await ctx.answerCbQuery("Заказ не найден", { show_alert: true });
      return;
    }

    updateOrderStatus(orderId, "rejected");
    await ctx.answerCbQuery("Заказ отклонен");
    await ctx.reply(`Статус заказа #${orderId}: rejected`, adminMainKeyboard());

    try {
      await ctx.telegram.sendMessage(order.userId, `Ваш заказ #${orderId} отклонен.`);
    } catch (error) {
      console.error("Не удалось отправить уведомление клиенту:", error);
    }
  });
};
