// import express from 'express';
// import { getBraintreeToken, createOrder } from '../controller/braintree.js';
// import braintree from 'braintree';
// import dotenv from 'dotenv';

// dotenv.config();

// const router = express.Router();

// // Directly using the credentials (replace with actual credentials)
// const gateway = new braintree.BraintreeGateway({
//   environment: braintree.Environment.Sandbox,
//   merchantId: 'k8xtcykmt8s6xmpm',
//   publicKey: 'sgsdtvz4xdbhyv2q',
//   privateKey: '6d01cf1ef454d87f0bd4c6511d5e371f',
// });

// router.get('/get-braintree-token', async (req, res) => {
//     try {
//         console.log('Attempting to generate Braintree client token...');
//         const token = await gateway.clientToken.generate({});
//         console.log('Generated Braintree client token:', token);
//         res.json({ clientToken: token });
//     } catch (error) {
//         console.error('Error generating Braintree token:', error.message);
//         res.status(500).json({
//             error: 'Error generating client token',
//             details: error.message,
//             stack: error.stack
//         });
//     }
// });

  
// router.post('/create-order', createOrder);

// export default router;


import express from 'express';
import { getBraintreeToken, createOrder } from '../controller/braintree.js';

const router = express.Router();

// Route to get Braintree client token
router.get('/get-braintree-token', getBraintreeToken);

// Route to create order and process payment
router.post('/create-order', createOrder);

export default router;
