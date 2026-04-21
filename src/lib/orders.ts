import { getSupabase } from './supabase';
import type { CartItem } from '@/context/CartContext';
import type { OrderItem, OrderStatus, PaymentStatus, ShippingAddress } from '@/types/order';

export type { OrderStatus } from '@/types/order';

export type CreateOrderPayload = {
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  address: string;
  country?: string;
  postalCode?: string;
  notes: string;
  paymentMethod: string;
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  items: CartItem[];
};

export type OrderRecord = {
  id: string;
  user_id: string | null;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  city: string;
  address: string;
  shipping_address: ShippingAddress | null;
  notes: string | null;
  payment_method: string;
  subtotal: number;
  shipping_amount: number;
  total_amount: number;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  items: OrderItem[];
  order_items: Array<{
    id: string;
    product_id: string;
    product_name: string;
    product_image: string;
    unit_price: number;
    quantity: number;
    selected_size: string | null;
  }>;
};

function normalizeOrderError(message?: string) {
  if (!message) return 'Could not load orders';
  const lower = message.toLowerCase();
  if (lower.includes("could not find the table 'public.orders'") || lower.includes('relation "public.orders" does not exist')) {
    return 'Orders database is not ready yet. Run Supabase migrations 003_orders.sql and 004_admin_order_roles.sql first.';
  }
  return message;
}

function toOrderItems(items: CartItem[]): OrderItem[] {
  return items.map((item) => ({
    product_id: item.id,
    name: item.name,
    name_en: item.name_en,
    price: item.price,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
    image: item.image,
  }));
}

function normalizeOrderRecord(order: any): OrderRecord {
  return {
    ...order,
    payment_status: (order.payment_status ?? 'pending') as PaymentStatus,
    shipping_address: order.shipping_address ?? null,
    stripe_session_id: order.stripe_session_id ?? null,
    stripe_payment_intent: order.stripe_payment_intent ?? null,
    items: Array.isArray(order.items)
      ? order.items
      : Array.isArray(order.order_items)
        ? order.order_items.map((item: any) => ({
            product_id: item.product_id,
            name: item.product_name,
            price: Number(item.unit_price),
            quantity: item.quantity,
            size: item.selected_size ?? undefined,
            image: item.product_image,
          }))
        : [],
  } as OrderRecord;
}

export async function createOrder(payload: CreateOrderPayload): Promise<{ ok: boolean; orderId?: string; orderNumber?: string; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase is not configured' };

  const shippingAddress: ShippingAddress = {
    country: payload.country || 'Saudi Arabia',
    city: payload.city,
    address: payload.address,
    postalCode: payload.postalCode || '',
  };
  const items = toOrderItems(payload.items);

  const { data: order, error: orderError } = await sb
    .from('orders')
    .insert({
      user_id: payload.userId,
      customer_name: payload.customerName,
      customer_email: payload.customerEmail,
      customer_phone: payload.customerPhone,
      city: payload.city,
      address: payload.address,
      shipping_address: shippingAddress,
      notes: payload.notes || null,
      payment_method: payload.paymentMethod,
      subtotal: payload.subtotal,
      shipping_amount: payload.shippingAmount,
      total_amount: payload.totalAmount,
      payment_status: 'pending',
      items,
    })
    .select('id, order_number')
    .single();

  if (orderError || !order) {
    return { ok: false, error: normalizeOrderError(orderError?.message) || 'Could not create order' };
  }

  const itemsPayload = payload.items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    product_image: item.image,
    unit_price: item.price,
    quantity: item.quantity,
    selected_size: item.size || null,
  }));

  const { error: itemsError } = await sb.from('order_items').insert(itemsPayload);
  if (itemsError) {
    return { ok: false, error: normalizeOrderError(itemsError.message) };
  }

  return { ok: true, orderId: order.id, orderNumber: order.order_number };
}

export async function getMyOrders(): Promise<{ ok: boolean; orders?: OrderRecord[]; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase is not configured' };

  const { data, error } = await sb
    .from('orders')
    .select(`
      id,
      user_id,
      order_number,
      status,
      payment_status,
      created_at,
      updated_at,
      customer_name,
      customer_email,
      customer_phone,
      city,
      address,
      shipping_address,
      notes,
      payment_method,
      subtotal,
      shipping_amount,
      total_amount,
      stripe_session_id,
      stripe_payment_intent,
      items,
      order_items (
        id,
        product_id,
        product_name,
        product_image,
        unit_price,
        quantity,
        selected_size
      )
    `)
    .order('created_at', { ascending: false });

  if (error) return { ok: false, error: normalizeOrderError(error.message) };
  return { ok: true, orders: (data ?? []).map(normalizeOrderRecord) };
}

export async function getAllOrders(): Promise<{ ok: boolean; orders?: OrderRecord[]; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase is not configured' };

  const { data, error } = await sb
    .from('orders')
    .select(`
      id,
      user_id,
      order_number,
      status,
      payment_status,
      created_at,
      updated_at,
      customer_name,
      customer_email,
      customer_phone,
      city,
      address,
      shipping_address,
      notes,
      payment_method,
      subtotal,
      shipping_amount,
      total_amount,
      stripe_session_id,
      stripe_payment_intent,
      items,
      order_items (
        id,
        product_id,
        product_name,
        product_image,
        unit_price,
        quantity,
        selected_size
      )
    `)
    .order('created_at', { ascending: false });

  if (error) return { ok: false, error: normalizeOrderError(error.message) };
  return { ok: true, orders: (data ?? []).map(normalizeOrderRecord) };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase is not configured' };

  const { error } = await sb
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) return { ok: false, error: normalizeOrderError(error.message) };
  return { ok: true };
}

export async function getOrderById(orderId: string): Promise<{ ok: boolean; order?: OrderRecord; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase is not configured' };

  const { data, error } = await sb
    .from('orders')
    .select(`
      id,
      user_id,
      order_number,
      status,
      payment_status,
      created_at,
      updated_at,
      customer_name,
      customer_email,
      customer_phone,
      city,
      address,
      shipping_address,
      notes,
      payment_method,
      subtotal,
      shipping_amount,
      total_amount,
      stripe_session_id,
      stripe_payment_intent,
      items,
      order_items (
        id,
        product_id,
        product_name,
        product_image,
        unit_price,
        quantity,
        selected_size
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) return { ok: false, error: normalizeOrderError(error.message) };
  return { ok: true, order: normalizeOrderRecord(data) };
}
