import { Router } from "express";
import auth from "../middleware/auth.js";
import { updateWishlistItemController , getWishlistController } from "../controllers/wishlist.controller.js"; 

const cartRouter = Router()

// Define routes for managing wishlist items 

// Update wishlist items
cartRouter.post('/update-wishlist',auth,updateWishlistItemController)

// Get wishlist items
cartRouter.get("/get-wishlist",auth,getWishlistController)

export default cartRouter