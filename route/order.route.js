import { Router } from 'express'
import auth from '../middleware/auth.js'
import { admin } from '../middleware/Admin.js'
import { seller } from '../middleware/seller.js' 
import { 
    CashOnDeliveryOrderController, 
    getAllOrders, 
    getOrderDetailsController, 
    getSellerOrders, 
    paymentController, 
    updateOrderStatus, 
    webhookStripe 
} from '../controllers/order.controller.js'

const orderRouter = Router()

// Define routes for managing orders (some require authentication and specific roles)

// Create a cash-on-delivery order (requires authentication)
orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)

// Process order payment (requires authentication)
orderRouter.post('/checkout',auth,paymentController)

// Handle Stripe webhook (for payment updates)
orderRouter.post('/webhook',webhookStripe)

// Get order details (requires authentication)
orderRouter.get("/order-list",auth,getOrderDetailsController)

// Get all orders (requires authentication and admin role)
orderRouter.get("/all-orders",auth,admin,getAllOrders)

// Get seller's orders (requires authentication and seller role)
orderRouter.post("/get-seller-orders",auth,seller,getSellerOrders)

// Update order status (requires authentication and seller role)
orderRouter.post("/update-order-status",auth,seller,updateOrderStatus)

export default orderRouter