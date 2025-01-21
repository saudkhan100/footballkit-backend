import Stripe from 'stripe';

const stripe = new Stripe('sk_test_zydt4YPVHm5MJmdydMnVoIKQ'); // Replace with your Stripe secret key

// Create a payment intent
// In your controller (e.g., stripeController.js)

export const createPaymentIntent = async (req, res) => {
  try {
    const { totalPrice } = req.body;

    if (!totalPrice || typeof totalPrice !== 'number') {
      console.log('Invalid or missing totalPrice:', totalPrice);  // Debugging
      return res.status(400).json({ message: 'Invalid or missing totalPrice' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100, // Convert to cents
      currency: 'usd',
    });

    console.log('Payment Intent created:', paymentIntent);  // Debugging
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Failed to create payment intent', error: error.message });
  }
};




// Verify a payment intent
// Verify a payment intent
export const verifyPaymentIntent = async (paymentIntentId) => {
  if (!paymentIntentId) {
      throw new Error('Payment intent ID is required');
  }
  try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
  } catch (error) {
      console.error('Error verifying payment intent:', error); // Detailed logging
      throw new Error(`Failed to retrieve payment intent: ${error.message}`);
  }
};

