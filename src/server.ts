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
  'http://localhost:5173',
  'https://api.bog.ge'
];

app.use(cors({
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    console.log('Incoming request from origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.json({
    status: 'ok',
    message: 'Uniqo Payment Server',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check endpoint accessed');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Routes
app.use('/api/payments', paymentRoutes);

app.listen(port, () => {
  console.log(`🚀 გადახდების სერვერი გაშვებულია პორტზე ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`BOG API URL: ${process.env.BOG_API_URL}`);
}); 