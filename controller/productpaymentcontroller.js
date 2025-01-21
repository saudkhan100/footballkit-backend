import ProductOrder from '../model/productorder.js';
import {user} from '../model/user.js';
import Product from '../model/product.js';
import { verifyToken } from '../jwt/auth.js'; // Assumes you have a verifyToken function for token validation
import { createPaymentIntent, verifyPaymentIntent } from '../payment/stripe.js';



export const createOrder = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Invalid or expired token' });

    const User = await user.findById(decoded.id);
    const product = await Product.findById(req.body.productId);

    if (!User || !product) {
      return res.status(404).json({ message: 'User or Product not found' });
    }

    const order = new ProductOrder({
      orderNumber: `ORD-${Date.now()}`,
      User: User._id,
      product: product._id,
      quantity: req.body.quantity,
      totalPrice: req.body.totalPrice,
      shippingAddress: req.body.shippingAddress,
      contactNumber: req.body.contactNumber,
      paymentId: req.body.paymentId,
      paymentStatus: 'paid',
    });

    await order.save();
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};




// Get all orders (admin or user-specific)
export const getOrders = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Invalid or expired token' });

    // Check user role or return orders based on role
    const user = await User.findById(decoded.id);

    if (user.role === 'admin') {
      // Admin can see all orders
      const orders = await ProductOrder.find().populate('user').populate('product');
      res.status(200).json(orders);
    } else {
      // Regular user can see their own orders
      const orders = await ProductOrder.find({ user: user._id }).populate('product');
      res.status(200).json(orders);
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Invalid or expired token' });

    const order = await ProductOrder.findById(req.params.id).populate('user').populate('product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the user is the owner or an admin
    const user = await User.findById(decoded.id);
    if (user.role !== 'admin' && order.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Update order (e.g., change status)
export const updateOrder = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Invalid or expired token' });

    // Admin check for updating orders
    const user = await User.findById(decoded.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const order = await ProductOrder.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user').populate('product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Invalid or expired token' });

    // Admin check for deleting orders
    const user = await User.findById(decoded.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const order = await ProductOrder.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};
