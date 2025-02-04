import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import ProductOrder from '../model/productorder.js';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Ensure this is set correctly in your environment variables

// Route: Create Payment Intent
router.post('/create-payment-intent', async (req, res) => {
  const { totalPrice } = req.body;

  try {
    const amountInCents = Math.round(Number(totalPrice) * 100);
    if (isNaN(amountInCents) || amountInCents < 50) {
      console.error(`[ERROR] Invalid amount: ${amountInCents}`);
      return res.status(400).json({ message: 'Amount must be at least $0.50 USD' });
    }

    // Creating a Payment Intent with card and PayPal as accepted payment methods
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method_types: ['card', 'paypal'], // Adding PayPal as a payment method
    });

    console.log(`[DEBUG] Returning Payment Intent ID: ${paymentIntent.id}`);
    console.log(`[DEBUG] Returning Client Secret: ${paymentIntent.client_secret}`);

    console.log(`[LOG] Payment Intent Created:`, {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error(`[ERROR] Creating Payment Intent: ${error.message}`);
    res.status(500).json({ error: 'Payment intent creation failed', details: error.message });
  }
});

// Route: Create Order
router.post('/create-order', async (req, res) => {
  const {
    userId,
    productId,
    quantity,
    totalPrice,
    shippingAddress,
    contactNumber,
    paymentIntentId,
  } = req.body;

  console.log('[LOG] Order creation request:', req.body);

  if (!userId || !paymentIntentId) {
    console.error('[ERROR] Missing required fields: userId or paymentIntentId');
    return res.status(400).json({
      message: 'Missing required fields: userId and paymentIntentId are required.',
    });
  }

  try {
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      console.error('[ERROR] Payment intent verification failed:', paymentIntent);
      return res.status(400).json({ message: 'Payment not completed or invalid.' });
    }

    console.log('[LOG] Payment Intent Verified:', paymentIntent);

    const order = new ProductOrder({
      orderNumber: `ORD-${Date.now()}`,
      user: userId,
      product: productId,
      quantity,
      totalPrice,
      shippingAddress,
      contactNumber,
      paymentId: paymentIntent.id,
      paymentStatus: 'paid',
    });

    await order.save();

    console.log('[LOG] Order Created:', order);

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error(`[ERROR] Creating Order: ${error.message}`);
    res.status(500).json({ error: 'Order creation failed', details: error.message });
  }
});

export default router;
