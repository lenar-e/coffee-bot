import { Markup } from "telegraf";
import { CartDetailsItem, Product } from "../types";

export const addToCartButton = (productId: number) =>
  Markup.inlineKeyboard([
    [Markup.button.callback("Добавить", `add_to_cart_${productId}`)]
  ]);

export const categoryMenuButtons = (categories: string[]) => {
  const rows: ReturnType<typeof Markup.button.callback>[][] = [];
  const perRow = 2;

  for (let i = 0; i < categories.length; i += perRow) {
    const row = categories
      .slice(i, i + perRow)
      .map((category, index) =>
        Markup.button.callback(category, `open_category_${i + index}`)
      );
    rows.push(row);
  }

  return Markup.inlineKeyboard(rows);
};

export const backToCategoriesButton = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback("Назад к категориям", "back_to_categories")]
  ]);

export const productsTileButtons = (products: Product[]) => {
  const rows: ReturnType<typeof Markup.button.callback>[][] = [];
  const perRow = 2;

  for (let i = 0; i < products.length; i += perRow) {
    const row = products.slice(i, i + perRow).map((product) =>
      Markup.button.callback(
        `${product.name} • ${product.price}₽`,
        `select_product_${product.id}`
      )
    );
    rows.push(row);
  }

  rows.push([Markup.button.callback("Назад к категориям", "back_to_categories")]);
  return Markup.inlineKeyboard(rows);
};

export const sizeSelectionButtons = (productId: number) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("S", `add_to_cart_${productId}_S`),
      Markup.button.callback("M", `add_to_cart_${productId}_M`),
      Markup.button.callback("L", `add_to_cart_${productId}_L`)
    ],
    [Markup.button.callback("Назад к категориям", "back_to_categories")]
  ]);

export const cartActionsButtons = (items: CartDetailsItem[]) => {
  const removeRows = items.map((item) => {
    const sizeLabel = item.size === "ONE" ? "" : ` (${item.size})`;
    return [
      Markup.button.callback(
        `Удалить: ${item.name}${sizeLabel}`,
        `remove_from_cart_${item.removeKey}`
      )
    ];
  });

  return Markup.inlineKeyboard([
    ...removeRows,
    [Markup.button.callback("Оформить заказ", "checkout_order")]
  ]);
};

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
