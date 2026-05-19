const { addToCart, getCartDetails, getCartTotal } = require("../services/cartService");
const { getAvailableProducts } = require("../services/productService");
const { addToCartButton, checkoutButton } = require("../keyboards/inlineKeyboards");
const { SCENE_ID: CHECKOUT_SCENE_ID } = require("./scenes/checkoutScene");

const registerClientHandlers = (bot) => {
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
    const cartItems = getCartDetails(ctx.session);
    if (!cartItems.length) {
      await ctx.reply("Корзина пуста. Нажмите «Меню», чтобы выбрать товар.");
      return;
    }

    const itemsText = cartItems
      .map((item) => `- ${item.name} x${item.quantity} = ${item.lineTotal} ₽`)
      .join("\n");
    const total = getCartTotal(ctx.session);

    await ctx.reply(`Ваш заказ:\n${itemsText}\n\nИтого: ${total} ₽`, checkoutButton());
  });

  bot.action(/^add_to_cart_(\d+)$/, async (ctx) => {
    const productId = Number(ctx.match[1]);
    const result = addToCart(ctx.session, productId);

    if (!result.ok) {
      await ctx.answerCbQuery(result.reason, { show_alert: true });
      return;
    }

    await ctx.answerCbQuery("Товар добавлен");
    await ctx.reply(`Добавлено в заказ: ${result.product.name}`);
  });

  bot.action("checkout_order", async (ctx) => {
    const cartItems = getCartDetails(ctx.session);
    if (!cartItems.length) {
      await ctx.answerCbQuery("Корзина пуста", { show_alert: true });
      return;
    }

    await ctx.answerCbQuery();
    await ctx.scene.enter(CHECKOUT_SCENE_ID);
  });
};

module.exports = {
  registerClientHandlers
};
