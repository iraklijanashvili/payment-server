import { Router } from 'express';
import { PaymentService } from '../services/payment.service';

const router = Router();
const paymentService = new PaymentService();

router.post('/create-order', async (req, res) => {
  try {
    const orderData = req.body;
    const result = await paymentService.createOrder(orderData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      error: 'შეცდომა გადახდის შექმნისას',
      details: error.message
    });
  }
});

router.get('/order-status/:orderId', async (req, res) => {
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