import Review from '../models/review.model.js'
import Product from '../models/product.model.js'
import Order from '../models/order.model.js'

//Create Review
export const createReview = async (req, res) => {
    const { userId ,productId, orderId , reviewText, rating } = req.body;
    
    // Input validation (optional but recommended)
    if ( !userId || !productId || !orderId || !reviewText || !rating ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, productId, orderId , reviewText, rating',
      });
    }
  
    try {
      // Create new review with validated data
      const newReview = new Review({
        user: userId,
        product:  productId,
        order :  orderId,
        reviewText,
        rating,
      });
  
      // Save the review
      const savedReview = await newReview.save();
      
      await Product.findByIdAndUpdate(productId, {
          $push: { reviews: savedReview._id },
      });
      
      await Order.findByIdAndUpdate(orderId, {
          $push: { reviews: savedReview._id },
      });
      
      res.status(200).json({
        success: true,
        message: 'Review submitted successfully!',
        data: savedReview,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Error submitting review: ' + err.message,
      });
    }
};