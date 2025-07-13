import { Router } from 'express'
import { seller } from '../middleware/seller.js'
import { admin } from '../middleware/Admin.js'
import { createProductController, deleteProductDetails, getProductByCategory, getProductByCategoryAndSubCategory, getProductController, getProductDetails, searchProduct, updateProductDetails , getProductBySeller, approveProduct, rejectProduct} from '../controllers/product.controller.js'
import auth from '../middleware/auth.js'

const productRouter = Router()

// Define routes for managing products

// Create a new product (requires authentication and seller role)
productRouter.post("/create",auth,seller,createProductController)

// Get all products (public)
productRouter.post('/get',getProductController)

// Get products by category (public)
productRouter.post("/get-product-by-category",getProductByCategory)

// Get products by category and subcategory (public)
productRouter.post('/get-pruduct-by-category-and-subcategory',getProductByCategoryAndSubCategory)

// Get a seller's products (requires authentication and seller role)
productRouter.post('/get-product-by-seller',auth,seller,getProductBySeller)

// Get details of a specific product (public)
productRouter.post('/get-product-details',getProductDetails)

// Update product details (requires authentication and seller role)
productRouter.put('/update-product-details',auth,seller,updateProductDetails)

// Delete a product (requires authentication and seller role)
productRouter.delete('/delete-product',auth,seller,deleteProductDetails)

// Search for products (public)
productRouter.post('/search-product',searchProduct)

// Approve a product (requires authentication and admin role)
productRouter.put('/approve-product',auth,admin,approveProduct)

// Reject a product (requires authentication and admin role)
productRouter.put('/reject-product',auth,admin,rejectProduct)



export default productRouter