import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, "Category name is required"],
        trim: true, 
        unique: true
    },
    description : {
        type : String,
        default : ""
    },
    image : {
        type : String,
        default : ""
    },
    bannerImage : {
        type : [String],
        default : []
    },
    deliveryOptions: {
        type: String, 
        enum: ['standard', 'quick'], 
        required: true 
    },
    isPopular: {
        type: Boolean,
        default: false 
    }
    
},{
    timestamps : true
})

const CategoryModel = mongoose.model('category',categorySchema)

export default CategoryModel