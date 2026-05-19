import { Scenes } from "telegraf";
import { adminMainKeyboard } from "../../keyboards/replyKeyboards";
import { addProduct } from "../../services/productService";
import { WizardState } from "../../types";

export const SCENE_ID = "add-product";

export const createAddProductScene = () =>
  new Scenes.WizardScene<any>(
    SCENE_ID,
    async (ctx) => {
      await ctx.reply("Введите название товара:");
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("Пожалуйста, отправьте название текстом.");
        return undefined;
      }

      const name = ctx.message.text.trim();
      if (!name) {
        await ctx.reply("Название не может быть пустым. Введите название:");
        return undefined;
      }

      (ctx.wizard.state as WizardState).name = name;
      await ctx.reply("Введите цену (в рублях):");
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("Пожалуйста, отправьте цену текстом.");
        return undefined;
      }

      const price = Number(ctx.message.text.trim());
      if (!Number.isFinite(price) || price <= 0) {
        await ctx.reply("Цена должна быть числом больше 0. Введите цену:");
        return undefined;
      }

      const product = addProduct({
        name: (ctx.wizard.state as WizardState).name || "",
        price: Math.round(price)
      });

      await ctx.reply(
        `Товар добавлен: ${product.name} — ${product.price} ₽`,
        adminMainKeyboard()
      );

      return ctx.scene.leave();
    }
  );
