import { connection } from './db/connection.js';
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userroutes.js';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import productRouter from './routes/productRoutes.js';
import orderRoutes from './routes/orderroutes.js'; 
import paymentRoutes from './routes/paymentroutes.js';
import reviewRoutes from './routes/reviewroutes.js';
import braintreepayment from './routes/braintreeroutes.js'

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static('uploads'));

// Define routes
app.use('/api',paymentRoutes)
app.use('/api', userRoutes);
app.use('/api', productRouter);
app.use('/api', orderRoutes);
app.use('/api', reviewRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

connection
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err) => {
    console.log('Error:', err);
  });

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'"); // Optional: Set CSP header
  next();
});
