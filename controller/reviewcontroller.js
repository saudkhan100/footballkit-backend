// controllers/reviewController.js
import Review from '../model/review.js'; 
import Product from '../model/product.js';
import { user } from '../model/user.js';
 

// Controller to create a review
import mongoose from 'mongoose';

export const createReview = async (req, res) => {
  const { productId, rating, comment, user } = req.body;

  console.log(user); // Check if the user is correctly coming from the request body

  if (!productId || !rating || !comment || !user) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Ensure user is a valid ObjectId, use 'new' if necessary
    const userId = new mongoose.Types.ObjectId(user); // Or mongoose.Types.ObjectId(user)

    // Create a new review
    const newReview = new Review({
      productId,
      rating,
      comment,
      user: userId,  // Ensure user is an ObjectId
    });

    // Save the review to the database
    const savedReview = await newReview.save();

    // Optionally: Update the product's review count or average rating
    const product = await Product.findById(productId);
    if (product) {
      product.reviews.push(savedReview._id);
      await product.save();
    }

    res.status(201).json(savedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


export const getReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    // Fetch reviews for the product and populate the user field (only firstName for now)
    const reviews = await Review.find({ productId })
      .populate("user", "firstname") // Populate only the 'firstName' field of the user
      .sort({ createdAt: -1 });

    // Check if reviews exist for the product
    if (!reviews.length) {
      return res.status(404).json({ message: "No reviews found for this product" });
    }

    // Send the reviews data back to the client
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Server error" });
  }
};


