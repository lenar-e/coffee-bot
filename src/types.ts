export type OrderStatus = "pending" | "accepted" | "rejected";

export interface Product {
  id: number;
  name: string;
  price: number;
  available: boolean;
}

export interface CartItem {
  productId: number;
  quantity: number;
}

export interface CartDetailsItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  userId: number;
  customerName: string;
  phone: string;
  items: CartDetailsItem[];
  totalPrice: number;
  status: OrderStatus;
}

export interface WizardState {
  customerName?: string;
  name?: string;
}

export interface AppSession {
  cart: CartItem[];
}

export type BotContext = any;
