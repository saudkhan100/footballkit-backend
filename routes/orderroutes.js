// routes/orderRoutes.js



import { createOrder,getOrders,getOrderById,updateOrder,deleteOrder } from '../controller/productpaymentcontroller.js';
import express from 'express';
const router = express.Router();

// Create a new order
router.post('/createorder', createOrder);

// Get all orders (admin or user-specific)
router.get('/', getOrders);

// Get a specific order by ID
router.get('/:id', getOrderById);

// Update an existing order
router.put('/:id', updateOrder);

// Delete an order
router.delete('/:id', deleteOrder);

export default router;
