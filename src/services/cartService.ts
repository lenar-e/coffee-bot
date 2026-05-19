import { AppSession, CartDetailsItem, CartItem, DrinkSize, Product } from "../types";
import { getProductById } from "./productService";

const ensureCart = (session: AppSession): void => {
  if (!Array.isArray(session.cart)) {
    session.cart = [];
  }
};

export const addToCart = (
  session: AppSession,
  productId: number,
  size: DrinkSize
):
  | { ok: true; product: Product }
  | { ok: false; reason: string } => {
  ensureCart(session);

  const product = getProductById(productId);
  if (!product || !product.available) {
    return { ok: false, reason: "Товар недоступен" };
  }

  const existingItem = session.cart.find(
    (item: CartItem) => item.productId === productId && item.size === size
  );
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    session.cart.push({ productId, quantity: 1, size });
  }

  return { ok: true, product };
};

const getSizeMultiplier = (size: DrinkSize): number => {
  if (size === "S") {
    return 0.85;
  }
  if (size === "L") {
    return 1.2;
  }
  return 1;
};

const formatRemoveKey = (productId: number, size: DrinkSize): string =>
  `${productId}_${size}`;

export const getCartDetails = (session: AppSession): CartDetailsItem[] => {
  ensureCart(session);

  return session.cart
    .map((item: CartItem) => {
      const product = getProductById(item.productId);
      if (!product) {
        return null;
      }

      const unitPrice = Math.round(product.price * getSizeMultiplier(item.size));
      return {
        productId: product.id,
        name: product.name,
        price: unitPrice,
        quantity: item.quantity,
        lineTotal: unitPrice * item.quantity,
        size: item.size,
        removeKey: formatRemoveKey(product.id, item.size)
      };
    })
    .filter((item): item is CartDetailsItem => Boolean(item));
};

export const getCartTotal = (session: AppSession): number =>
  getCartDetails(session).reduce((sum, item) => sum + item.lineTotal, 0);

export const clearCart = (session: AppSession): void => {
  session.cart = [];
};

export const removeFromCart = (
  session: AppSession,
  productId: number,
  size: DrinkSize
): boolean => {
  ensureCart(session);
  const index = session.cart.findIndex(
    (item: CartItem) => item.productId === productId && item.size === size
  );

  if (index === -1) {
    return false;
  }

  session.cart.splice(index, 1);
  return true;
};
