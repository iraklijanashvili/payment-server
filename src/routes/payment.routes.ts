import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';

const router = Router();
const paymentService = new PaymentService();

router.post('/create-order', async (req: Request, res: Response) => {
  try {
    console.log('Received order request:', req.body);
    const orderData = req.body;
    const result = await paymentService.createOrder(orderData);
    console.log('Payment service response:', result);
    res.json(result);
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: 'შეცდომა გადახდის შექმნისას',
      details: error.message,
      stack: error.stack
    });
  }
});

router.get('/order-status/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const status = await paymentService.getOrderStatus(orderId);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({
      error: 'შეცდომა გადახდის სტატუსის მიღებისას',
      details: error.message
    });
  }
});

export const paymentRoutes = router; 