import mongoose from 'mongoose';

const productOrder = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  contactNumber: { type: String, required: true },
  paymentId: { type: String, required: true }, // Stripe payment ID
  paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  createdAt: { type: Date, default: Date.now }
});



const ProductOrder = mongoose.model('ProductOrder', productOrder);

export default ProductOrder;
