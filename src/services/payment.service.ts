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

  constructor() {
    this.clientId = process.env.BOG_CLIENT_ID || '';
    this.clientSecret = process.env.BOG_CLIENT_SECRET || '';
    this.merchantId = process.env.BOG_MERCHANT_ID || '';
    this.apiUrl = process.env.BOG_API_URL || '';

    if (!this.clientId || !this.clientSecret || !this.merchantId || !this.apiUrl) {
      throw new Error('გთხოვთ შეავსოთ ყველა საჭირო გარემოს ცვლადი');
    }
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
      const token = this.generateJWT();
      
      const response = await axios.post(
        `${this.apiUrl}/orders`,
        {
          ...orderData,
          merchantId: this.merchantId,
          redirectUrl: process.env.BOG_REDIRECT_URL,
          locale: 'ka',
          showShippingFields: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('შეცდომა გადახდის შექმნისას:', error);
      throw error;
    }
  }

  async getOrderStatus(orderId: string) {
    try {
      const token = this.generateJWT();
      
      const response = await axios.get(
        `${this.apiUrl}/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('შეცდომა გადახდის სტატუსის მიღებისას:', error);
      throw error;
    }
  }
} 