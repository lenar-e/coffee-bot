const { Markup } = require("telegraf");

const addToCartButton = (productId) =>
  Markup.inlineKeyboard([
    [Markup.button.callback("Добавить", `add_to_cart_${productId}`)]
  ]);

const checkoutButton = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback("Оформить заказ", "checkout_order")]
  ]);

const adminProductButtons = (product) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback(
        product.available ? "Сделать недоступным" : "Сделать доступным",
        `toggle_product_${product.id}`
      )
    ],
    [Markup.button.callback("Удалить", `delete_product_${product.id}`)]
  ]);

const adminOrderButtons = (orderId) =>
  Markup.inlineKeyboard([
    [Markup.button.callback("Принять", `order_accept_${orderId}`)],
    [Markup.button.callback("Отклонить", `order_reject_${orderId}`)]
  ]);

module.exports = {
  addToCartButton,
  checkoutButton,
  adminProductButtons,
  adminOrderButtons
};
