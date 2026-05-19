import { Markup } from "telegraf";

export const clientMainKeyboard = () =>
  Markup.keyboard([["Меню", "Мой заказ"]]).resize();

export const adminMainKeyboard = () =>
  Markup.keyboard([["Товары", "Заказы"], ["Добавить товар"]]).resize();
