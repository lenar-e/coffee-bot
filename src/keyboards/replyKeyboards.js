const { Markup } = require("telegraf");

const clientMainKeyboard = () =>
  Markup.keyboard([["Меню", "Мой заказ"]]).resize();

const adminMainKeyboard = () =>
  Markup.keyboard([["Товары", "Заказы"], ["Добавить товар"]]).resize();

module.exports = {
  clientMainKeyboard,
  adminMainKeyboard
};
