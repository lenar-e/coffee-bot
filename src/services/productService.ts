import { products } from "../data/products";
import { Product } from "../types";

let nextProductId = products.length
  ? Math.max(...products.map((item) => item.id)) + 1
  : 1;

export const getAllProducts = (): Product[] => products;

export const getAvailableProducts = (): Product[] =>
  products.filter((item) => item.available);

export const getProductById = (id: number): Product | null =>
  products.find((item) => item.id === id) || null;

export const addProduct = ({
  name,
  price
}: {
  name: string;
  price: number;
}): Product => {
  const product: Product = {
    id: nextProductId++,
    name,
    price,
    available: true
  };

  products.push(product);
  return product;
};

export const deleteProduct = (id: number): boolean => {
  const index = products.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }

  products.splice(index, 1);
  return true;
};

export const toggleProductAvailability = (id: number): Product | null => {
  const product = getProductById(id);
  if (!product) {
    return null;
  }

  product.available = !product.available;
  return product;
};
