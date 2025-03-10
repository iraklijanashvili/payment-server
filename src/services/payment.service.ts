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
        ...orderData,
        merchantId: this.merchantId,
        redirectUrl: this.redirectUrl,
        locale: 'ka',
        showShippingFields: false,
      };

      console.log('Sending request to BOG:', {
        url: `${this.apiUrl}/orders`,
        data: bogOrderData
      });

      const response = await axios.post(
        `${this.apiUrl}/orders`,
        bogOrderData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('BOG API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in createOrder:', error.response?.data || error.message);
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