// routes/productRoutes.js
import express from 'express';
import multer from 'multer';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controller/productcontroller.js';
import upload from '../controller/multer.js';
const router = express.Router();


router.post('/products', upload.array('images',5), createProduct);
router.put('/products/:id', upload.array('images', 5), updateProduct);

router.get('/allproducts', getAllProducts);
router.get('/products/:id', getProductById);
router.delete('/products/:id', deleteProduct);

export default router;
