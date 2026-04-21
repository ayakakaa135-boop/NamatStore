import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

interface CheckoutItem {
  product_id: string;
  name: string;
  name_en: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
}

interface RequestBody {
  orderId: string;
  items: CheckoutItem[];
  customerEmail: string;
  shippingAddress: {
    country: string;
    city: string;
    address: string;
    postalCode: string;
  };
  successUrl: string;
  cancelUrl: string;
}

export const handler: Handler = async (event) => {
  // السماح فقط بـ POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // التحقق من وجود Stripe key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Payment system is not configured' }),
      };
    }

    // قراءة البيانات من الطلب
    const body: RequestBody = JSON.parse(event.body || '{}');

    // التحقق من صحة البيانات
    if (!body.orderId || !body.items || !body.customerEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Missing required fields: orderId, items, or customerEmail' 
        }),
      };
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Items array is empty or invalid' }),
      };
    }

    // تحويل المنتجات إلى line items لـ Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = body.items.map(item => {
      // التحقق من صحة بيانات المنتج
      if (!item.name || !item.price || !item.quantity) {
        throw new Error(`Invalid item data for product: ${item.product_id}`);
      }

      // إنشاء وصف تفصيلي للمنتج
      let description = item.name_en || item.name;
      if (item.size) description += ` - Size: ${item.size}`;
      if (item.color) description += ` - Color: ${item.color}`;

      return {
        price_data: {
          currency: 'sar', // الريال السعودي
          product_data: {
            name: item.name,
            description: description,
            images: item.image ? [item.image] : [],
            metadata: {
              product_id: item.product_id,
              size: item.size || '',
              color: item.color || '',
            },
          },
          unit_amount: Math.round(item.price * 100), // تحويل إلى هللة (cents)
        },
        quantity: item.quantity,
      };
    });

    // إعداد معلومات الشحن
    const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 0, // شحن مجاني
            currency: 'sar',
          },
          display_name: 'Free Shipping',
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: 3,
            },
            maximum: {
              unit: 'business_day',
              value: 7,
            },
          },
        },
      },
    ];

    // إنشاء Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
      customer_email: body.customerEmail,
      shipping_options: shippingOptions,
      shipping_address_collection: {
        allowed_countries: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'JO', 'EG'],
      },
      metadata: {
        order_id: body.orderId,
        shipping_city: body.shippingAddress.city,
        shipping_country: body.shippingAddress.country,
      },
      locale: 'ar', // اللغة العربية
      billing_address_collection: 'auto',
      phone_number_collection: {
        enabled: true,
      },
      // إضافة معلومات إضافية
      custom_text: {
        submit: {
          message: 'سيتم تأكيد طلبك خلال 24 ساعة',
        },
      },
    });

    console.log('Stripe session created:', session.id);

    // إرجاع معلومات الجلسة
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
    };

  } catch (error: any) {
    console.error('Stripe checkout error:', error);

    // معالجة أخطاء Stripe المحددة
    let errorMessage = 'An error occurred while creating checkout session';
    let statusCode = 500;

    if (error.type === 'StripeCardError') {
      errorMessage = 'Card was declined';
      statusCode = 400;
    } else if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid request parameters';
      statusCode = 400;
    } else if (error.type === 'StripeAPIError') {
      errorMessage = 'Payment service is temporarily unavailable';
      statusCode = 503;
    } else if (error.type === 'StripeConnectionError') {
      errorMessage = 'Network error connecting to payment service';
      statusCode = 503;
    } else if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Payment service authentication failed';
      statusCode = 500;
    }

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: errorMessage,
        details: error.message,
      }),
    };
  }
};
