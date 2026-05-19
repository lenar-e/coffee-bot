import { Markup } from "telegraf";
import { Product } from "../types";

export const addToCartButton = (productId: number) =>
  Markup.inlineKeyboard([
    [Markup.button.callback("Добавить", `add_to_cart_${productId}`)]
  ]);

export const checkoutButton = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback("Оформить заказ", "checkout_order")]
  ]);

export const adminProductButtons = (product: Product) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback(
        product.available ? "Сделать недоступным" : "Сделать доступным",
        `toggle_product_${product.id}`
      )
    ],
    [Markup.button.callback("Удалить", `delete_product_${product.id}`)]
  ]);

export const adminOrderButtons = (orderId: number) =>
  Markup.inlineKeyboard([
    [Markup.button.callback("Принять", `order_accept_${orderId}`)],
    [Markup.button.callback("Отклонить", `order_reject_${orderId}`)]
  ]);
