import { AppSession, CartDetailsItem, CartItem, Product } from "../types";
import { getProductById } from "./productService";

const ensureCart = (session: AppSession): void => {
  if (!Array.isArray(session.cart)) {
    session.cart = [];
  }
};

export const addToCart = (
  session: AppSession,
  productId: number
):
  | { ok: true; product: Product }
  | { ok: false; reason: string } => {
  ensureCart(session);

  const product = getProductById(productId);
  if (!product || !product.available) {
    return { ok: false, reason: "Товар недоступен" };
  }

  const existingItem = session.cart.find((item: CartItem) => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    session.cart.push({ productId, quantity: 1 });
  }

  return { ok: true, product };
};

export const getCartDetails = (session: AppSession): CartDetailsItem[] => {
  ensureCart(session);

  return session.cart
    .map((item: CartItem) => {
      const product = getProductById(item.productId);
      if (!product) {
        return null;
      }

      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity
      };
    })
    .filter((item): item is CartDetailsItem => Boolean(item));
};

export const getCartTotal = (session: AppSession): number =>
  getCartDetails(session).reduce((sum, item) => sum + item.lineTotal, 0);

export const clearCart = (session: AppSession): void => {
  session.cart = [];
};
