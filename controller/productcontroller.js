import Product from '../model/product.js';
import upload from './multer.js';
import fs from 'fs';
import path from 'path';

// Create a new product
// Create a new product
export const createProduct = async (req, res) => {  
  const { title, description, type, subcategory, team, size = [], price, quantity } = req.body;
  const imageUrls = req.files.map(file => `/uploads/${file.filename}`); // Collect image paths

  try {
    const product = new Product({
      title,
      description,
      price,
      quantity,   
      size, 
      type,   
      subcategory,
      team,
      images: imageUrls, 
    });

    await product.save();
    res.status(201).json(product);
  } catch (saveError) {
    console.error('Error saving product:', saveError);
    res.status(500).json({ message: 'Error saving product.', error: saveError.message });
  }
};


export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products.', error: error.message });
  }
};


export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product.', error: error.message });
  }
};


// Update a product
export const updateProduct = async (req, res) => {
  const { title, description, category, color, size, gender, brand, price, available } = req.body;
  let updatedData = {
    title,
    description,
    category,
    color,
    size,
    gender,
    brand,
    price,
    available
  };

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.files && req.files.length > 0) {
      // Remove old images
      product.images.forEach(image => {
        fs.unlinkSync(`./uploads/${image.split('/').pop()}`);
      });

      updatedData.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product.', error: error.message });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete images
    product.images.forEach(image => {
      const filePath = path.join('./uploads', image.split('/').pop());

      // Check if file exists before deleting
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        console.warn(`File not found: ${filePath}`);
      }
    });

    // Delete the product
    await Product.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product.', error: error.message });
  }
};
