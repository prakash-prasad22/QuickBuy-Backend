import { Router } from 'express'
import auth from '../middleware/auth.js'
import { addAddressController, deleteAddresscontroller, getAddressController, updateAddressController } from '../controllers/address.controller.js'

const addressRouter = Router()// Create a new Router instance

// Define address-related routes
// - Requires authentication for all routes

// Create a new address
addressRouter.post('/create',auth,addAddressController)

// Get user's addresses
addressRouter.get("/get",auth,getAddressController)

// Update an existing address
addressRouter.put('/update',auth,updateAddressController)

// Disable/delete an address
addressRouter.delete("/disable",auth,deleteAddresscontroller)

export default addressRouter