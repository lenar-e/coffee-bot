import { Telegraf } from "telegraf";
import {
  backToCategoriesButton,
  cartActionsButtons,
  categoryMenuButtons,
  productsTileButtons,
  sizeSelectionButtons
} from "../keyboards/inlineKeyboards";
import {
  getAvailableCategories,
  getAvailableProductsByCategory,
  getProductById
} from "../services/productService";
import {
  addToCart,
  getCartDetails,
  getCartTotal,
  removeFromCart
} from "../services/cartService";
import { AppSession, BotContext, DrinkSize } from "../types";
import { SCENE_ID as CHECKOUT_SCENE_ID } from "./scenes/checkoutScene";

export const registerClientHandlers = (bot: Telegraf<BotContext>): void => {
  const showCategories = async (ctx: BotContext) => {
    const categories = getAvailableCategories();
    if (!categories.length) {
      await ctx.reply("Сейчас нет доступных категорий.");
      return;
    }

    await ctx.reply("Выберите категорию:", categoryMenuButtons(categories));
  };

  bot.hears("Меню", async (ctx) => {
    await showCategories(ctx);
  });

  bot.action(/^open_category_(\d+)$/, async (ctx) => {
    const categoryIndex = Number(ctx.match[1]);
    const categories = getAvailableCategories();
    const category = categories[categoryIndex];

    if (!category) {
      await ctx.answerCbQuery("Категория не найдена", { show_alert: true });
      return;
    }

    await ctx.answerCbQuery();

    const products = getAvailableProductsByCategory(category);
    if (!products.length) {
      await ctx.reply(`В категории «${category}» пока нет товаров.`, backToCategoriesButton());
      return;
    }

    const productsText = products
      .map((product, index) => `${index + 1}. ${product.name} — ${product.price} ₽`)
      .join("\n");

    await ctx.reply(
      `Категория: ${category}\n\n${productsText}\n\nНажмите на товар, чтобы добавить в заказ:`,
      productsTileButtons(products)
    );
  });

  bot.action("back_to_categories", async (ctx) => {
    await ctx.answerCbQuery();
    await showCategories(ctx);
  });

  bot.hears("Мой заказ", async (ctx) => {
    const cartItems = getCartDetails(ctx.session as AppSession);
    if (!cartItems.length) {
      await ctx.reply("Корзина пуста. Нажмите «Меню», чтобы выбрать товар.");
      return;
    }

    const itemsText = cartItems
      .map((item) => {
        const sizeLabel = item.size === "ONE" ? "" : ` (${item.size})`;
        return `- ${item.name}${sizeLabel} x${item.quantity} = ${item.lineTotal} ₽`;
      })
      .join("\n");
    const total = getCartTotal(ctx.session as AppSession);

    await ctx.reply(`Ваш заказ:\n${itemsText}\n\nИтого: ${total} ₽`, cartActionsButtons(cartItems));
  });

  bot.action(/^select_product_(\d+)$/, async (ctx) => {
    const productId = Number(ctx.match[1]);
    const product = getProductById(productId);
    if (!product || !product.available) {
      await ctx.answerCbQuery("Товар недоступен", { show_alert: true });
      return;
    }

    await ctx.answerCbQuery();
    const requiresSize = product.category !== "Десерты";
    if (!requiresSize) {
      const result = addToCart(ctx.session as AppSession, productId, "ONE");
      if (result.ok === false) {
        await ctx.reply(result.reason);
        return;
      }
      await ctx.reply(`Добавлено в заказ: ${result.product.name}`);
      return;
    }

    await ctx.reply(`Выберите размер для ${product.name}:`, sizeSelectionButtons(productId));
  });

  bot.action(/^add_to_cart_(\d+)_(S|M|L|ONE)$/, async (ctx) => {
    const productId = Number(ctx.match[1]);
    const size = ctx.match[2] as DrinkSize;
    const result = addToCart(ctx.session as AppSession, productId, size);

    if (result.ok === false) {
      await ctx.answerCbQuery(result.reason, { show_alert: true });
      return;
    }

    await ctx.answerCbQuery("Товар добавлен");
    const sizeLabel = size === "ONE" ? "" : ` (${size})`;
    await ctx.reply(`Добавлено в заказ: ${result.product.name}${sizeLabel}`);
  });

  bot.action(/^remove_from_cart_(\d+)_(S|M|L|ONE)$/, async (ctx) => {
    const productId = Number(ctx.match[1]);
    const size = ctx.match[2] as DrinkSize;
    const removed = removeFromCart(ctx.session as AppSession, productId, size);

    if (!removed) {
      await ctx.answerCbQuery("Позиция не найдена", { show_alert: true });
      return;
    }

    await ctx.answerCbQuery("Позиция удалена");
    const cartItems = getCartDetails(ctx.session as AppSession);
    if (!cartItems.length) {
      await ctx.reply("Корзина пуста. Нажмите «Меню», чтобы выбрать товар.");
      return;
    }

    const itemsText = cartItems
      .map((item) => {
        const sizeLabel = item.size === "ONE" ? "" : ` (${item.size})`;
        return `- ${item.name}${sizeLabel} x${item.quantity} = ${item.lineTotal} ₽`;
      })
      .join("\n");
    const total = getCartTotal(ctx.session as AppSession);

    await ctx.reply(`Ваш заказ:\n${itemsText}\n\nИтого: ${total} ₽`, cartActionsButtons(cartItems));
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
