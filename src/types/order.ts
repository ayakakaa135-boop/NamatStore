export interface OrderItem {
  product_id: string;
  name: string;
  name_en?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
}

export interface ShippingAddress {
  country: string;
  city: string;
  address: string;
  postalCode: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress | null;
  notes?: string | null;
  items: OrderItem[];
  total_amount: number;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  stripe_session_id?: string | null;
  stripe_payment_intent?: string | null;
  tracking_number?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StripeCheckoutRequest {
  orderId: string;
  items: OrderItem[];
  customerEmail: string;
  shippingAddress: ShippingAddress;
  shippingAmount: number;
  successUrl: string;
  cancelUrl: string;
}

export interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}
