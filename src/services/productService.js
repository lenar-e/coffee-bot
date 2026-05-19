const { products } = require("../data/products");

let nextProductId = products.length
  ? Math.max(...products.map((item) => item.id)) + 1
  : 1;

const getAllProducts = () => products;

const getAvailableProducts = () => products.filter((item) => item.available);

const getProductById = (id) => products.find((item) => item.id === id) || null;

const addProduct = ({ name, price }) => {
  const product = {
    id: nextProductId++,
    name,
    price,
    available: true
  };

  products.push(product);
  return product;
};

const deleteProduct = (id) => {
  const index = products.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }

  products.splice(index, 1);
  return true;
};

const toggleProductAvailability = (id) => {
  const product = getProductById(id);
  if (!product) {
    return null;
  }

  product.available = !product.available;
  return product;
};

module.exports = {
  getAllProducts,
  getAvailableProducts,
  getProductById,
  addProduct,
  deleteProduct,
  toggleProductAvailability
};
