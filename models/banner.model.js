import mongoose from "mongoose";

const bannerImagesSchema = new mongoose.Schema({
    image : {
        type : String,
        default : ""
    },
},{
    timestamps : true
})

const bannerImageModel = mongoose.model('bannerImage',bannerImagesSchema)

export default bannerImageModel