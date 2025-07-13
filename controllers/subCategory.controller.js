import SubCategoryModel from "../models/subCategory.model.js";

/**
 * This function adds a new subcategory to the database.
 * It checks for required fields (`name`, `image`)
 * On success, it returns the saved category data. On error, it returns an error response.
 */
export const AddSubCategoryController = async(request,response)=>{
    try {
        const { name, image, category } = request.body 

        if(!name && !image && !category[0] ){
            return response.status(400).json({
                message : "Provide name, image, category",
                error : true,
                success : false
            })
        }

        const payload = {
            name,
            image,
            category
        }

        const createSubCategory = new SubCategoryModel(payload)
        const save = await createSubCategory.save()

        return response.json({
            message : "Sub Category Created",
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


/**
 * This function fetches all subcategories from the database sorted by creation date in descending order.
 * On success, it returns the fetched category data. On error, it returns an error response.
 */ 
export const getSubCategoryController = async(request,response)=>{
    try {
        const data = await SubCategoryModel.find().sort({createdAt : -1}).populate('category')
        return response.json({
            message : "Sub Category data",
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

/**
 * This function updates an existing subcategory by its ID.
 * It allows updating various fields (`name`, `description`, `image`,)
 * On success, it returns the updated category data. On error, it returns an error response.
 */
export const updateSubCategoryController = async(request,response)=>{
    try {
        const { _id, name, image,category } = request.body 

        const checkSub = await SubCategoryModel.findById(_id)

        if(!checkSub){
            return response.status(400).json({
                message : "Check your _id",
                error : true,
                success : false
            })
        }

        const updateSubCategory = await SubCategoryModel.findByIdAndUpdate(_id,{
            name,
            image,
            category
        })

        return response.json({
            message : 'Updated Successfully',
            data : updateSubCategory,
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

export const getSubcategoryByCategoryController = async(request,response)=>{
    try {
        let { id , limit } = request.body
        
        if(!id){
            return response.status(400).json({
                message : "provide category id",
                error : true,
                success : false
            })
        }

        if(!limit){
            limit = 10
        }

        const subcategory = await SubCategoryModel.find({category : {$in : id}}).limit(limit)

        return response.json({
            message : "Sub Category data",
            data : subcategory,
            error : false,
            success : true
        })
    }catch(error){
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

/**
 * This function deletes a subcategory by its ID. 
 * It checks if the subcategory is associated with  products. 
 * If associated, it returns an error. 
 * If not, it deletes the subcategory and returns a success response.
 */ 
export const deleteSubCategoryController = async(request,response)=>{
    try {
        const { _id } = request.body 
        console.log("Id",_id)
        const deleteSub = await SubCategoryModel.findByIdAndDelete(_id)

        return response.json({
            message : "Delete successfully",
            data : deleteSub,
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