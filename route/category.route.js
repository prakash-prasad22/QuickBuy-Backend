import { Router } from 'express'
import auth from '../middleware/auth.js'
import { AddCategoryController, deleteCategoryController, getCategoryController, getCategoryByIdController, updateCategoryController } from '../controllers/category.controller.js'

const categoryRouter = Router()

// Define routes for managing product categories (some require authentication)

// Add a new category (requires authentication)
categoryRouter.post("/add-category",auth,AddCategoryController)

// Get all categories
categoryRouter.get('/get',getCategoryController)

// Get a category by its ID
categoryRouter.post('/get-category-by-id',getCategoryByIdController)

// Update an existing category (requires authentication)
categoryRouter.put('/update',auth,updateCategoryController)

// Delete a category (requires authentication)
categoryRouter.delete("/delete",auth,deleteCategoryController)

export default categoryRouter