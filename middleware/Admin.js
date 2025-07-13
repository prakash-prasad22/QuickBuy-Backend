import UserModel from "../models/user.model.js"

/**
 * Middleware to check if the user has admin role.
*/
export const admin = async(request,response,next)=>{
    try {
       const  userId = request.userId  // Get user ID from request

       const user = await UserModel.findById(userId)  // Find user by ID

       if(user.role !== 'ADMIN'){
            return response.status(400).json({
                message : "Permission denial",
                error : true,
                success : false
            })
       }

       next()   // If user has admin role, proceed to the next middleware/route handler

    } catch (error) {
        return response.status(500).json({
            message : "Permission denial",
            error : true,
            success : false
        })
    }
}