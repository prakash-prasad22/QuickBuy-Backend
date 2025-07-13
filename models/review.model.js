import mongoose from "mongoose";
import product from "./product.model.js"

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "product",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    order:{
      type: mongoose.Schema.ObjectId,
      ref: "order",
    },
    reviewText: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/,function(next){
  this.populate({
    path: "user",
    select: "name avatar",
  });

  next();
});

reviewSchema.statics.calcAverageRating = async function(productId){

  //this points the current review
  const stats = await this.aggregate([{
    $match:{product:productId}
  },
  {
    $group:{
      _id : '$product',
      numOfRating: {$sum:1},
      avgRating:{$avg:'$rating'}
    }
  }
  ])

  await product.findByIdAndUpdate(productId,{
      totalRating: stats[0].numOfRating,
      averageRating: stats[0].avgRating,
    })
}

reviewSchema.post('save',function(){
  this.constructor.calcAverageRating(this.product)
})


export default mongoose.model("Review", reviewSchema);
