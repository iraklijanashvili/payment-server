import jwt from 'jsonwebtoken';
import axios from 'axios';

interface CreateOrderRequest {
  amount: number;
  currency: string;
  intent: string;
  items: Array<{
    amount: number;
    description: string;
    quantity: number;
    product_id: string;
  }>;
}

export class PaymentService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly merchantId: string;
  private readonly apiUrl: string;
  private readonly redirectUrl: string;

  constructor() {
    this.clientId = process.env.BOG_CLIENT_ID || '';
    this.clientSecret = process.env.BOG_CLIENT_SECRET || '';
    this.merchantId = process.env.BOG_MERCHANT_ID || '';
    this.apiUrl = process.env.BOG_API_URL || '';
    this.redirectUrl = process.env.BOG_REDIRECT_URL || '';

    if (!this.clientId || !this.clientSecret || !this.merchantId || !this.apiUrl || !this.redirectUrl) {
      throw new Error('გთხოვთ შეავსოთ ყველა საჭირო გარემოს ცვლადი');
    }

    console.log('Payment service initialized with:', {
      apiUrl: this.apiUrl,
      merchantId: this.merchantId,
      redirectUrl: this.redirectUrl
    });
  }

  private generateJWT(): string {
    const payload = {
      iss: this.clientId,
      aud: ['bog'],
      exp: Math.floor(Date.now() / 1000) + (60 * 5), // 5 წუთი
    };

    return jwt.sign(payload, this.clientSecret);
  }

  async createOrder(orderData: CreateOrderRequest) {
    try {
      console.log('Creating order with data:', orderData);
      const token = this.generateJWT();
      
      const bogOrderData = {
        intent: orderData.intent,
        items: orderData.items.map(item => ({
          amount: item.amount,
          description: item.description,
          quantity: item.quantity,
          product_id: item.product_id
        })),
        locale: "ka",
        shop_order_id: Date.now().toString(),
        redirect_url: this.redirectUrl,
        show_shop_order_id_on_extract: true,
        capture_method: "AUTOMATIC",
        purchase_units: [
          {
            amount: {
              currency_code: orderData.currency,
              value: orderData.amount.toFixed(2)
            }
          }
        ]
      };

      console.log('Sending request to BOG:', {
        url: `${this.apiUrl}/v1/checkout/orders`,
        data: bogOrderData,
        token: token.substring(0, 10) + '...'
      });

      const response = await axios.post(
        `${this.apiUrl}/v1/checkout/orders`,
        bogOrderData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('BOG API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in createOrder:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      throw error;
    }
  }

  async getOrderStatus(orderId: string) {
    try {
      console.log('Getting order status for:', orderId);
      const token = this.generateJWT();
      
      const response = await axios.get(
        `${this.apiUrl}/v1/checkout/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      console.log('Order status response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error getting order status:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      throw error;
    }
  }
} 