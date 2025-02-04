// import braintree from 'braintree';
// import dotenv from 'dotenv';

// dotenv.config();

// const gateway = new braintree.BraintreeGateway({
//   environment: braintree.Environment.Sandbox,
//   merchantId: 'k8xtcykmt8s6xmpm',
//   publicKey: 'sgsdtvz4xdbhyv2q',
//   privateKey: '6d01cf1ef454d87f0bd4c6511d5e371f',
// });


// // Route to get Braintree client token
// export const getBraintreeToken = async (req, res) => {
//     try {
//       console.log("Generating Braintree client token...");
//       const { clientToken } = await gateway.clientToken.generate({});
//       res.json({ clientToken });
//     } catch (error) {
//       console.error("Error generating Braintree token:", error);
//       res.status(500).json({
//         error: "Error generating client token",
//         details: error.message,
//         stack: error.stack,
//       });
//     }
//   };
  

// // Route to handle order creation and payment verification
// export const createOrder = async (req, res) => {
//   const { nonce, productId, totalPrice, userId, shippingAddress, contactNumber } = req.body;

//   try {
//     const result = await gateway.transaction.sale({
//       amount: totalPrice.toFixed(2),
//       paymentMethodNonce: nonce,
//       options: { submitForSettlement: true },
//     });

//     if (result.success) {
//       const order = new ProductOrder({
//         orderNumber: `ORD-${Date.now()}`,
//         user: userId,
//         product: productId,
//         totalPrice,
//         shippingAddress,
//         contactNumber,
//         paymentId: result.transaction.id,
//         paymentStatus: 'paid',
//       });

//       await order.save();
//       res.status(201).json({ message: 'Order created successfully', order });
//     } else {
//       res.status(400).json({ message: 'Payment failed' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Error processing payment', details: error.message });
//   }
// };


import braintree from 'braintree';
import dotenv from 'dotenv';
import { Types } from 'mongoose';
import ProductOrder from '../model/productorder.js';

dotenv.config();

// Set up Braintree gateway
const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID || 'missing_merchant_id',
    publicKey: process.env.BRAINTREE_PUBLIC_KEY || 'missing_public_key',
    privateKey: process.env.BRAINTREE_PRIVATE_KEY || 'missing_private_key',
  });
  

console.log('Braintree Config:', process.env.BRAINTREE_MERCHANT_ID, process.env.BRAINTREE_PUBLIC_KEY, process.env.BRAINTREE_PRIVATE_KEY);


// Generate Braintree client token
export const getBraintreeToken = async (req, res) => {
    try {
      const { clientToken } = await gateway.clientToken.generate({});
      res.json({ clientToken });
    } catch (error) {
      console.error('Error generating Braintree token:', error);
      res.status(500).json({
        error: 'Error generating client token',
        details: error.message,
        stack: error.stack,
      });
    }
  };

// Create order and handle payment
export const createOrder = async (req, res) => {
  const { userId, productId, title, totalPrice, shippingAddress, contactNumber, nonce } = req.body;

  try {
    // Validate the nonce
    const result = await gateway.transaction.sale({
      amount: totalPrice.toFixed(2),
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true,
      },
    });

    if (result.success) {
      // Create a new order
      const order = new ProductOrder({
        user: Types.ObjectId(userId), // Ensure userId is an ObjectId
        product: Types.ObjectId(productId), // Ensure productId is an ObjectId
        totalPrice,
        shippingAddress,
        contactNumber,
        paymentId: result.transaction.id,
        paymentStatus: 'paid',
      });

      await order.save();
      res.status(201).json({ message: 'Order created successfully', order });
    } else {
      res.status(400).json({ message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Error processing payment', details: error.message });
  }
};
