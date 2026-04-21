// src/types/order.ts

export interface OrderItem {
  product_id: string;
  name: string;
  name_en: string;
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

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  notes?: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  stripe_session_id?: string;
  stripe_payment_intent?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 
  | 'pending'      // في انتظار المعالجة
  | 'confirmed'    // تم التأكيد
  | 'processing'   // جاري التجهيز
  | 'shipped'      // تم الشحن
  | 'delivered'    // تم التسليم
  | 'cancelled';   // ملغي

export type PaymentStatus = 
  | 'pending'      // في انتظار الدفع
  | 'paid'         // مدفوع
  | 'failed'       // فشل الدفع
  | 'refunded';    // مسترجع

export interface CreateOrderPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  notes?: string;
  items: OrderItem[];
  total_amount: number;
  user_id: string | null;
}

export interface StripeCheckoutRequest {
  orderId: string;
  items: OrderItem[];
  customerEmail: string;
  shippingAddress: ShippingAddress;
  successUrl: string;
  cancelUrl: string;
}

export interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  user_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}
