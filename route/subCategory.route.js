import { Router } from "express";
import auth from "../middleware/auth.js";
import { 
    AddSubCategoryController, 
    deleteSubCategoryController, 
    getSubCategoryController, 
    updateSubCategoryController , 
    getSubcategoryByCategoryController 
} from "../controllers/subCategory.controller.js";

const subCategoryRouter = Router()

// Define routes for managing product sub-categories

// Create a new sub-category (requires authentication)
subCategoryRouter.post('/create',auth,AddSubCategoryController)

// Get all sub-categories (public)
subCategoryRouter.post('/get',getSubCategoryController)

// Update an existing sub-category (requires authentication)
subCategoryRouter.put('/update',auth,updateSubCategoryController)

// Get sub-categories by category (public)
subCategoryRouter.post('/getByCategory',getSubcategoryByCategoryController)

// Delete a sub-category (requires authentication)
subCategoryRouter.delete('/delete',auth,deleteSubCategoryController)

export default subCategoryRouter