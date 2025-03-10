import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { paymentRoutes } from './routes/payment.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// CORS კონფიგურაცია
const allowedOrigins = [
  'https://uniqo.ge',
  'https://www.uniqo.ge',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Uniqo Payment Server',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/payments', paymentRoutes);

app.listen(port, () => {
  console.log(`🚀 გადახდების სერვერი გაშვებულია პორტზე ${port}`);
}); 