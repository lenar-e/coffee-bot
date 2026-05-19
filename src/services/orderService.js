const { orders } = require("../data/orders");

let nextOrderId = 1;

const createOrder = ({
  userId,
  customerName,
  phone,
  items,
  totalPrice
}) => {
  const order = {
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

const getAllOrders = () => orders;

const getOrderById = (id) => orders.find((order) => order.id === id) || null;

const updateOrderStatus = (id, status) => {
  const order = getOrderById(id);
  if (!order) {
    return null;
  }

  order.status = status;
  return order;
};

const formatOrderItems = (items) =>
  items
    .map((item) => `- ${item.name} x${item.quantity} = ${item.lineTotal} ₽`)
    .join("\n");

const formatOrderForAdmin = (order) => {
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

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  formatOrderForAdmin
};
