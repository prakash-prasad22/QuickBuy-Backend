import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name : {
        type : String,
    },
    image : {
        type : Array,
        default : []
    },
    category : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'category'
        }
    ],
    subCategory : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'subCategory'
        }
    ],
    unit : {
        type : String,
        default : ""
    },
    stock : {
        type : Number,
        default : 0
    },
    price : {
        type : Number,
        defualt : null
    },
    discount : {
        type : Number,
        default : null
    },
    description : {
        type : String,
        default : ""
    },
    more_details : {
        type : Object,
        default : {}
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending', 
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
        required: [true, "Seller is required"], 
    }, 
    rejectReason: { 
        type: String, 
        default: null 
    }, 
    reviews: [{ 
        type: mongoose.Schema.ObjectId, 
        ref: "Review" 
    }],
    averageRating: {
        type: Number,
        default: 0,
    },
    totalRating: {
        type: Number,
        default: 0,
    }
},
{
    timestamps: true,
});
    
    //create a text index
    productSchema.index({
        name: "text",
        description: "text",
    }, {
        weights: {
        name: 10,
        description: 5,
    },
});
    
const ProductModel = mongoose.model("product", productSchema);
    
export default ProductModel;