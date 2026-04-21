import type { TFunction } from 'i18next';
import type { OrderStatus } from './orders';

export const ORDER_STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export function getOrderStatusMeta(status: OrderStatus, t: TFunction) {
  const base = {
    pending: {
      label: t('orders.status.pending'),
      description: t('orders.statusHint.pending'),
      chipClass: 'bg-[#f6eee0] text-[#8e6335] border-[#ead7bc]',
    },
    confirmed: {
      label: t('orders.status.confirmed'),
      description: t('orders.statusHint.confirmed'),
      chipClass: 'bg-[#edf2f8] text-[#234a68] border-[#cddbe8]',
    },
    processing: {
      label: t('orders.status.processing'),
      description: t('orders.statusHint.processing'),
      chipClass: 'bg-[#f7f1e8] text-[#7d5f2d] border-[#e7d8bc]',
    },
    shipped: {
      label: t('orders.status.shipped'),
      description: t('orders.statusHint.shipped'),
      chipClass: 'bg-[#eef5f3] text-[#255449] border-[#cde0d9]',
    },
    delivered: {
      label: t('orders.status.delivered'),
      description: t('orders.statusHint.delivered'),
      chipClass: 'bg-[#edf7ef] text-[#23643b] border-[#cee6d4]',
    },
    cancelled: {
      label: t('orders.status.cancelled'),
      description: t('orders.statusHint.cancelled'),
      chipClass: 'bg-[#fbefef] text-[#9d3b3b] border-[#f0d1d1]',
    },
    refunded: {
      label: t('orders.status.cancelled'),
      description: t('orders.statusHint.cancelled'),
      chipClass: 'bg-[#f4f1fb] text-[#5a468f] border-[#ddd4f2]',
    },
  } satisfies Record<OrderStatus, { label: string; description: string; chipClass: string }>;

  return base[status];
}
