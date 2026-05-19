const { getProductById } = require("./productService");

const ensureCart = (session) => {
  if (!Array.isArray(session.cart)) {
    session.cart = [];
  }
};

const addToCart = (session, productId) => {
  ensureCart(session);

  const product = getProductById(productId);
  if (!product || !product.available) {
    return { ok: false, reason: "Товар недоступен" };
  }

  const existingItem = session.cart.find((item) => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    session.cart.push({ productId, quantity: 1 });
  }

  return { ok: true, product };
};

const getCartDetails = (session) => {
  ensureCart(session);

  return session.cart
    .map((item) => {
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
    .filter(Boolean);
};

const getCartTotal = (session) =>
  getCartDetails(session).reduce((sum, item) => sum + item.lineTotal, 0);

const clearCart = (session) => {
  session.cart = [];
};

module.exports = {
  addToCart,
  getCartDetails,
  getCartTotal,
  clearCart
};
