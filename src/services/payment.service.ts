import axios from 'axios';

interface CreateOrderRequest {
  amount: number;
  currency: string;
  items: Array<{
    amount: number;
    description: string;
    quantity: number;
    product_id: string;
  }>;
}

export class PaymentService {
  private readonly publicKey: string;
  private readonly secretKey: string;
  private readonly merchantId: string;
  private readonly apiUrl: string;
  private readonly redirectUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.publicKey = process.env.BOG_CLIENT_ID || '';
    this.secretKey = process.env.BOG_CLIENT_SECRET || '';
    this.merchantId = process.env.BOG_MERCHANT_ID || '';
    this.apiUrl = process.env.BOG_API_URL || '';
    this.redirectUrl = process.env.BOG_REDIRECT_URL || '';

    if (!this.publicKey || !this.secretKey || !this.merchantId || !this.apiUrl || !this.redirectUrl) {
      throw new Error('გთხოვთ შეავსოთ ყველა საჭირო გარემოს ცვლადი');
    }

    console.log('გადახდის სერვისი ინიციალიზებულია:', {
      apiUrl: this.apiUrl,
      merchantId: this.merchantId,
      redirectUrl: this.redirectUrl
    });
  }

  private async getAccessToken(): Promise<string> {
    try {
      if (this.accessToken && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      console.log('ვიღებთ ახალ წვდომის ტოკენს');
      
      const response = await axios.post(
        'https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token',
        'grant_type=client_credentials',
        {
          auth: {
            username: this.publicKey,
            password: this.secretKey
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (!response.data.access_token) {
        throw new Error('წვდომის ტოკენი ვერ მოიძებნა პასუხში');
      }

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      console.log('მიღებულია ახალი წვდომის ტოკენი');
      return response.data.access_token;
    } catch (error: any) {
      console.error('შეცდომა წვდომის ტოკენის მიღებისას:', error.response?.data || error.message);
      throw new Error('შეცდომა წვდომის ტოკენის მიღებისას');
    }
  }

  async createOrder(orderData: CreateOrderRequest) {
    try {
      console.log('ვქმნით შეკვეთას მონაცემებით:', orderData);
      const token = await this.getAccessToken();
      
      const bogOrderData = {
        merchantId: this.merchantId,
        purchase_units: {
          currency: orderData.currency,
          total_amount: orderData.amount,
          basket: orderData.items.map(item => ({
            product_id: item.product_id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.amount
          }))
        },
        callback_url: this.redirectUrl,
        redirect_urls: {
          success: `${process.env.FRONTEND_URL}/payment/status`,
          fail: `${process.env.FRONTEND_URL}/payment/status`
        },
        capture: "automatic",
        locale: "ka"
      };

      console.log('ვაგზავნით მოთხოვნას BOG-ში:', {
        url: `${this.apiUrl}/payments/v1/checkout/orders`,
        data: bogOrderData
      });

      const response = await axios.post(
        `${this.apiUrl}/payments/v1/checkout/orders`,
        bogOrderData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('BOG API პასუხი:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('შეცდომა შეკვეთის შექმნისას:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  async getOrderStatus(orderId: string) {
    try {
      console.log('ვამოწმებთ შეკვეთის სტატუსს:', orderId);
      const token = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.apiUrl}/payments/v1/receipt/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('შეკვეთის სტატუსის პასუხი:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('შეცდომა შეკვეთის სტატუსის მიღებისას:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
} 