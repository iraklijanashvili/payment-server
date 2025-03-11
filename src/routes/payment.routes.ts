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

router.post('/callback', async (req: Request, res: Response) => {
  try {
    console.log('Received payment callback:', req.body);
    const { order_id, status, payment_hash } = req.body;
    
    // აქ შეგიძლიათ დაამატოთ payment_hash-ის ვალიდაცია უსაფრთხოებისთვის
    
    // სტატუსის დამუშავება
    if (status === 'success') {
      console.log(`გადახდა წარმატებით დასრულდა ორდერისთვის: ${order_id}`);
      // აქ შეგიძლიათ დაამატოთ ლოგიკა წარმატებული გადახდის დასამუშავებლად
    } else if (status === 'failed') {
      console.log(`გადახდა ვერ შესრულდა ორდერისთვის: ${order_id}`);
      // აქ შეგიძლიათ დაამატოთ ლოგიკა წარუმატებელი გადახდის დასამუშავებლად
    }

    res.status(200).json({ message: 'Callback received successfully' });
  } catch (error: any) {
    console.error('Error processing payment callback:', error);
    res.status(500).json({
      error: 'შეცდომა callback-ის დამუშავებისას',
      details: error.message
    });
  }
});

export const paymentRoutes = router; 