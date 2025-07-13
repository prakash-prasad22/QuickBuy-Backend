import BannerImageModel from "../models/banner.model.js";


// Function to create a new banner image
export const addBannerImageController = async(request,response)=>{
    try {
        const { image } = request.body 

        if(!image  ){
            return response.status(400).json({
                message : "Provide Banner Image",
                error : true,
                success : false
            })
        }

        const payload = {
            image
        }

        const createBannerImage = new BannerImageModel(payload)
        const save = await createBannerImage.save()

        return response.json({
            message : "Banner Image Added",
            data : save,
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


// Function to retrieve all banner images
export const getbannerImageController = async(request,response)=>{
    try {
        const data = await BannerImageModel.find()
        return response.json({
            message : "Banner Image",
            data : data,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// Function to delete a banner image by ID
export const deleteBannerImageController = async(request,response)=>{
    try {
        const { _id } = request.body 
        const deleteBanner = await BannerImageModel.findByIdAndDelete(_id)

        return response.json({
            message : "Delete successful",
            data : deleteBanner,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}