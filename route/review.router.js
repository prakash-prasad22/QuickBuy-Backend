import { Router } from "express";
import auth from "../middleware/auth.js";
import { createReview } from "../controllers/review.controller.js";

const reviewRouter = Router()

// Define route for creating a review (requires authentication)
reviewRouter.post('/create-review',auth,createReview)

export default reviewRouter