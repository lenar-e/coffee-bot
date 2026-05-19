const { Scenes } = require("telegraf");
const {
  clearCart,
  getCartDetails,
  getCartTotal
} = require("../../services/cartService");
const { createOrder, formatOrderForAdmin } = require("../../services/orderService");
const { clientMainKeyboard } = require("../../keyboards/replyKeyboards");
const { adminOrderButtons } = require("../../keyboards/inlineKeyboards");

const SCENE_ID = "checkout-order";

const createCheckoutScene = ({ adminId }) =>
  new Scenes.WizardScene(
    SCENE_ID,
    async (ctx) => {
      const items = getCartDetails(ctx.session);
      if (!items.length) {
        await ctx.reply("Корзина пуста.", clientMainKeyboard());
        return ctx.scene.leave();
      }

      await ctx.reply("Введите ваше имя:");
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("Пожалуйста, отправьте имя текстом.");
        return undefined;
      }

      ctx.wizard.state.customerName = ctx.message.text.trim();
      if (!ctx.wizard.state.customerName) {
        await ctx.reply("Имя не может быть пустым. Введите имя:");
        return undefined;
      }

      await ctx.reply("Введите телефон:");
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("Пожалуйста, отправьте телефон текстом.");
        return undefined;
      }

      const phone = ctx.message.text.trim();
      if (!/^\+?[0-9()\-\s]{6,20}$/.test(phone)) {
        await ctx.reply("Некорректный номер. Пример: +79991234567");
        return undefined;
      }

      const items = getCartDetails(ctx.session);
      if (!items.length) {
        await ctx.reply("Корзина пуста.", clientMainKeyboard());
        return ctx.scene.leave();
      }

      const totalPrice = getCartTotal(ctx.session);
      const order = createOrder({
        userId: ctx.from.id,
        customerName: ctx.wizard.state.customerName,
        phone,
        items,
        totalPrice
      });

      // После создания заказа очищаем корзину, чтобы избежать повторной отправки.
      clearCart(ctx.session);
      await ctx.reply("Ваш заказ отправлен", clientMainKeyboard());

      if (adminId) {
        try {
          await ctx.telegram.sendMessage(
            adminId,
            `Новый заказ!\n\n${formatOrderForAdmin(order)}`,
            adminOrderButtons(order.id)
          );
        } catch (error) {
          console.error("Не удалось отправить уведомление администратору:", error);
        }
      }

      return ctx.scene.leave();
    }
  );

module.exports = {
  SCENE_ID,
  createCheckoutScene
};
