import UserModel from "../models/user.model.js"

/**
 * Middleware to check if the user has the "seller" role.
*/

export const seller = async (request, response, next) => {
  try {
    const userId = request.userId // Get user ID from request

    const user = await UserModel.findById(userId);// Find user by ID

    if (!user.isSeller) {
      return response.status(400).json({
        message: "Permission denied: You are not a seller.",
        error: true,
        success: false,
      })
    }

    next();// Proceed to the next middleware/route handler

  } catch (error) {
    return response.status(500).json({
      message: "Permission denial: An error occurred.",
      error: true,
      success: false,
    })
  }
}