import { Router } from "express";
import auth from "../middleware/auth.js";
import { 
    addToCartItemController, 
    deleteCartItemQtyController, 
    getCartItemController, 
    updateCartItemQtyController 
} from "../controllers/cart.controller.js";

const cartRouter = Router()

// Define routes for managing cart items (all require authentication)

// Add an item to the cart
cartRouter.post('/create',auth,addToCartItemController)

// Get all items in the cart
cartRouter.get("/get",auth,getCartItemController)

// Update the quantity of an item in the cart
cartRouter.put('/update-qty',auth,updateCartItemQtyController)

// Delete an item from the cart
cartRouter.delete('/delete-cart-item',auth,deleteCartItemQtyController)

export default cartRouter