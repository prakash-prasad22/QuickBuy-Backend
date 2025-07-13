import WishlistProductModel from "../models/wishlist.model.js";
import UserModel from "../models/user.model.js";

/**
 * Adds or removes a product from the user's wishlist.
 */
export const updateWishlistItemController = async (request, response) => {
  try {
    const userId = request.userId
    const { productId } = request.body; // Destructuring for clarity

    if (!productId && !userId) {
      return response.status(400).json({ // Use 400 for bad request
        message: "Please provide a valid product ID & user ID",
        error: true,
        success: false,
      });
    }

    const existingWishlistItem = await WishlistProductModel.findOne({
      userId,
      productId,
    });

    if (existingWishlistItem) {
      const removedItem = await WishlistProductModel.deleteOne({
        _id: existingWishlistItem._id,
      });

      await UserModel.updateOne(
        { _id: userId },
        { $pull: { wishlist: productId } } // Use $pull for removal
      );

      return response.json({
        message: "Item removed from wishlist successfully.",
        error: false,
        success: true,
        data: removedItem,
      });
    }

    const newWishlistItem = new WishlistProductModel({
      userId,
      productId,
    });

    const savedItem = await newWishlistItem.save();

    await UserModel.updateOne(
      { _id: userId },
      { $push: { wishlist: productId } } // Use $push for adding
    );

    return response.status(201).json({ // Use 201 for created resource
      message: "Item added to wishlist successfully.",
      error: false,
      success: true,
      data: savedItem,
    });
  } catch (error) {
    console.error("Error updating wishlist item:", error); // Log specific error
    return response.status(500).json({
      message: "An error occurred. Please try again later.",
      error: true,
      success: false,
    });
  }
};

/**
 * Retrieves a user's wishlist items.
 */
export const getWishlistController = async (request, response) => {
  try {
    const userId = request.userId;

    const wishlistItems = await WishlistProductModel.find({ userId }).populate(
      "productId" // Populate only necessary field
    );

    return response.json({
      data: wishlistItems,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: "An error occurred. Please try again later.",
      error: true,
      success: false,
    });
  }
};
