import { Router } from "express";
import auth from "../middleware/auth.js";
import { addBannerImageController , 
        getbannerImageController ,
        deleteBannerImageController 
       } from "../controllers/bannerImage.controller.js"; 

const bannerImageRouter = Router()

// Define routes for managing banner images

// Create a new banner image (requires authentication)
bannerImageRouter.post('/create',auth,addBannerImageController) 

// Get all banner images
bannerImageRouter.get('/get',getbannerImageController)

// Delete a banner image (requires authentication)
bannerImageRouter.delete('/delete',auth,deleteBannerImageController)

export default bannerImageRouter