import { Telegraf } from "telegraf";
import { addToCartButton, checkoutButton } from "../keyboards/inlineKeyboards";
import { getAvailableProducts } from "../services/productService";
import { addToCart, getCartDetails, getCartTotal } from "../services/cartService";
import { AppSession, BotContext } from "../types";
import { SCENE_ID as CHECKOUT_SCENE_ID } from "./scenes/checkoutScene";

export const registerClientHandlers = (bot: Telegraf<BotContext>): void => {
  bot.hears("Меню", async (ctx) => {
    const products = getAvailableProducts();

    if (!products.length) {
      await ctx.reply("Сейчас нет доступных товаров.");
      return;
    }

    await ctx.reply("Доступные товары:");

    for (const product of products) {
      await ctx.reply(
        `${product.name}\nЦена: ${product.price} ₽\nНаличие: ${
          product.available ? "Да" : "Нет"
        }`,
        addToCartButton(product.id)
      );
    }
  });

  bot.hears("Мой заказ", async (ctx) => {
    const cartItems = getCartDetails(ctx.session as AppSession);
    if (!cartItems.length) {
      await ctx.reply("Корзина пуста. Нажмите «Меню», чтобы выбрать товар.");
      return;
    }

    const itemsText = cartItems
      .map((item) => `- ${item.name} x${item.quantity} = ${item.lineTotal} ₽`)
      .join("\n");
    const total = getCartTotal(ctx.session as AppSession);

    await ctx.reply(`Ваш заказ:\n${itemsText}\n\nИтого: ${total} ₽`, checkoutButton());
  });

  bot.action(/^add_to_cart_(\d+)$/, async (ctx) => {
    const productId = Number(ctx.match[1]);
    const result = addToCart(ctx.session as AppSession, productId);

    if (result.ok === false) {
      await ctx.answerCbQuery(result.reason, { show_alert: true });
      return;
    }

    await ctx.answerCbQuery("Товар добавлен");
    await ctx.reply(`Добавлено в заказ: ${result.product.name}`);
  });

  bot.action("checkout_order", async (ctx) => {
    const cartItems = getCartDetails(ctx.session as AppSession);
    if (!cartItems.length) {
      await ctx.answerCbQuery("Корзина пуста", { show_alert: true });
      return;
    }

    await ctx.answerCbQuery();
    await ctx.scene.enter(CHECKOUT_SCENE_ID);
  });
};
