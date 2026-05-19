export type OrderStatus = "pending" | "accepted" | "rejected";
export type DrinkSize = "S" | "M" | "L" | "ONE";

export interface Product {
  id: number;
  name: string;
  price: number;
  available: boolean;
  category: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
  size: DrinkSize;
}

export interface CartDetailsItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
  size: DrinkSize;
  removeKey: string;
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
  category?: string;
}

export interface AppSession {
  cart: CartItem[];
}

export type BotContext = any;
