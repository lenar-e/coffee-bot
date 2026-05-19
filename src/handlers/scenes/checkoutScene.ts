import { Scenes } from "telegraf";
import { adminOrderButtons } from "../../keyboards/inlineKeyboards";
import { clientMainKeyboard } from "../../keyboards/replyKeyboards";
import { clearCart, getCartDetails, getCartTotal } from "../../services/cartService";
import { createOrder, formatOrderForAdmin } from "../../services/orderService";
import { AppSession, WizardState } from "../../types";

export const SCENE_ID = "checkout-order";

export const createCheckoutScene = ({ adminId }: { adminId?: string }) =>
  new Scenes.WizardScene<any>(
    SCENE_ID,
    async (ctx) => {
      const items = getCartDetails(ctx.session as AppSession);
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

      (ctx.wizard.state as WizardState).customerName = ctx.message.text.trim();
      if (!(ctx.wizard.state as WizardState).customerName) {
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

      const items = getCartDetails(ctx.session as AppSession);
      if (!items.length) {
        await ctx.reply("Корзина пуста.", clientMainKeyboard());
        return ctx.scene.leave();
      }

      const totalPrice = getCartTotal(ctx.session as AppSession);
      const order = createOrder({
        userId: ctx.from.id,
        customerName: (ctx.wizard.state as WizardState).customerName || "",
        phone,
        items,
        totalPrice
      });

      // После создания заказа очищаем корзину, чтобы избежать повторной отправки.
      clearCart(ctx.session as AppSession);
      await ctx.reply("Ваш заказ отправлен", clientMainKeyboard());

      if (adminId) {
        try {
          await ctx.telegram.sendMessage(
            Number(adminId),
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
