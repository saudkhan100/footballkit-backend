// import express from 'express';
// import { createUser, loginUser,getUserByEmail,googleLogin,getAllUsers,updateUser,approveUser } from '../controller/usercontroller.js';
// import { authenticateJWT } from './authmiddleware.js';
// import { renewSubscription } from '../controller/subscriptioncontroller.js';
// import Stripe from 'stripe';
// import dotenv from 'dotenv';
// dotenv.config();


// const router = express.Router();

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// router.post('/create-payment-intent', async (req, res) => {
//     const { subscriptionType, promocode } = req.body;

//     try {
//         let amount;
//         if (subscriptionType === 'premium') {
//             amount = 2000; // $20.00 in cents
//         } else {
//             amount = 0; // Free plan
//         }

//         if (promocode && promocode === 'DISCOUNT50') {
//             amount = amount * 0.5; // 50% discount
//         }

//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: amount,
//             currency: 'usd',
//             payment_method_types: ['card'],
//         });

//         res.status(200).send({
//             clientSecret: paymentIntent.client_secret,
//             amount: amount / 100, // Send amount in dollars for display purposes
//         });
//     } catch (error) {
//         console.error('Error creating payment intent:', error);
//         res.status(500).json({ error: 'Payment intent creation failed', details: error.message });
//     }
// });



//   router.post('/subscribe', async (req, res) => {
//     const { userId, subscriptionType, paymentIntentId } = req.body;
  
//     try {
//       // Retrieve the payment intent to verify the payment status
//       const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
//       if (paymentIntent.status !== 'succeeded') {
//         return res.status(400).json({ message: 'Payment not completed' });
//       }
  
//       // Create or update the user's subscription
//       const newEndDate = subscriptionType === 'premium'
//         ? new Date(Date.now() + 1 * 30 * 24 * 60 * 60 * 1000) // 1 month for premium
//         : new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000); // 3 months for basic (free)
  
//       const newSubscription = new Subscription({
//         userId: userId,
//         subscriptionType,
//         subscriptionEndDate: newEndDate,
//       });
  
//       await newSubscription.save();
  
//       // Update the user's subscription reference
//       const existingUser = await user.findByIdAndUpdate(
//         userId,
//         { subscription: newSubscription._id },
//         { new: true }
//       );
  
//       res.status(200).json({ message: 'Subscription successful', user: existingUser });
//     } catch (error) {
//       console.error('Error processing subscription:', error);
//       res.status(500).json({ error: 'Subscription failed', details: error.message });
//     }
//   });
  


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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method_types: ['card'],
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