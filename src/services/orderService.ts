import { orders } from "../data/orders";
import { CartDetailsItem, Order, OrderStatus } from "../types";

let nextOrderId = 1;

export const createOrder = ({
  userId,
  customerName,
  phone,
  items,
  totalPrice
}: {
  userId: number;
  customerName: string;
  phone: string;
  items: CartDetailsItem[];
  totalPrice: number;
}): Order => {
  const order: Order = {
    id: nextOrderId++,
    userId,
    customerName,
    phone,
    items,
    totalPrice,
    status: "pending"
  };

  orders.push(order);
  return order;
};

export const getAllOrders = (): Order[] => orders;

export const getOrderById = (id: number): Order | null =>
  orders.find((order) => order.id === id) || null;

export const updateOrderStatus = (
  id: number,
  status: OrderStatus
): Order | null => {
  const order = getOrderById(id);
  if (!order) {
    return null;
  }

  order.status = status;
  return order;
};

const formatOrderItems = (items: CartDetailsItem[]): string =>
  items
    .map((item) => `- ${item.name} x${item.quantity} = ${item.lineTotal} ₽`)
    .join("\n");

export const formatOrderForAdmin = (order: Order): string => {
  const itemsText = formatOrderItems(order.items);
  return (
    `Заказ #${order.id}\n` +
    `Клиент: ${order.customerName}\n` +
    `Телефон: ${order.phone}\n` +
    `Состав:\n${itemsText}\n` +
    `Сумма: ${order.totalPrice} ₽\n` +
    `Статус: ${order.status}`
  );
};
