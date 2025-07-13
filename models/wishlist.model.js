import mongoose from "mongoose";

const wishlistProductSchema = new mongoose.Schema({
    productId : {
        type : mongoose.Schema.ObjectId,
        ref : 'product'
    },
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : "User"
    }
},{
    timestamps : true
})

const WishlistProductModel = mongoose.model('wishlist',wishlistProductSchema)

export default WishlistProductModel