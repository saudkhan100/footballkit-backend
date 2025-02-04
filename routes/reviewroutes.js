// routes/reviewRoutes.js
import express from 'express';
import { createReview,getReviews } from '../controller/reviewcontroller.js';

const router = express.Router();

// Route to create a review
router.post('/reviews', createReview);

// Route to get reviews for a specific product
router.get('/reviews/:productId', getReviews);

export default router;
