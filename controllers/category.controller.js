import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";
import ProductModel from "../models/product.model.js";

/**
 * This function adds a new category to the database.
 * It checks for required fields (`name`, `image`, and `deliveryOptions`) and sets `isPopular` to `false` by default if not provided.
 * On success, it returns the saved category data. On error, it returns an error response.
 */
export const AddCategoryController = async(request,response)=>{
    try {
        const { name , description ,image , bannerImage , deliveryOptions , isPopular } = request.body 

        if(!name || !image || !deliveryOptions){
            return response.status(400).json({
                message : "Enter required fields: name , image and deliveryOptions",
                error : true,
                success : false
            })
        }

        const addCategory = new CategoryModel({
            name,
            description,
            image,
            bannerImage,
            deliveryOptions,
            isPopular : isPopular || false, // Set default to false if not provided
        })

        const saveCategory = await addCategory.save()

        if(!saveCategory){
            return response.status(500).json({
                message : "Error in saving category",
                error : true,
                success : false
            })
        }

        return response.json({
            message : "Category added successfully",
            data : saveCategory,
            success : true,
            error : false
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
 * This function fetches all categories from the database sorted by creation date in descending order.
 * On success, it returns the fetched category data. On error, it returns an error response.
 */ 
export const getCategoryController = async(request,response)=>{
    try {
        
        const data = await CategoryModel.find().sort({ createdAt : -1 })

        return response.json({
            data : data,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.messsage || error,
            error : true,
            success : false
        })
    }
}


/**
 * This function fetches a specific category by its ID.
 * It checks for the `_id` property in the request body and returns an error response if missing.
 * On success, it returns the fetched category data. On error, it returns an error response.
 */ 
export const getCategoryByIdController = async(request , response) => {
    try{
        const { _id } = request.body

        if(!_id){
            return response.status(400).json({
                message:"Provide Category Id",
                error : true,
                success : false
            })
        }

        const productData = await CategoryModel.findById(_id)

        if(!productData){
            return response.status(400).json({
                message : "Category not found",
                error : true,
                success : false
            })
        }

        return response.json({
            message : `Data for Category ${_id}`,
            success : true,
            error : false,
            data : productData
        })
    }catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}


/**
 * This function updates an existing category by its ID.
 * It allows updating various fields (`name`, `description`, `image`, `bannerImage`, `deliveryOptions`, and `isPopular`).
 * On success, it returns the updated category data. On error, it returns an error response.
 */
export const updateCategoryController = async(request,response)=>{
    try {
        const { _id ,name, description , image, bannerImage , deliveryOptions , isPopular} = request.body 

        const update = await CategoryModel.updateOne({
            _id : _id
        },{
           name, 
           description,
           image ,
           bannerImage,
           deliveryOptions,
           isPopular : isPopular || false,
        })

        return response.json({
            message : "Category updated successfully",
            success : true,
            error : false,
            data : update
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
 * This function deletes a category by its ID. 
 * It checks if the category is associated with any sub-categories or products. 
 * If associated, it returns an error. 
 * If not, it deletes the category and returns a success response.
 */ 
export const deleteCategoryController = async(request,response)=>{
    try {
        const { _id } = request.body 

        const checkSubCategory = await SubCategoryModel.find({
            category : {
                "$in" : [ _id ]
            }
        }).countDocuments()

        const checkProduct = await ProductModel.find({
            category : {
                "$in" : [ _id ]
            }
        }).countDocuments()

        if(checkSubCategory >  0 || checkProduct > 0 ){
            return response.status(400).json({
                message : "Category is already in use ... Can't delete",
                error : true,
                success : false
            })
        }

        const deleteCategory = await CategoryModel.deleteOne({ _id : _id})

        return response.json({
            message : "Category deleted successfully",
            data : deleteCategory,
            error : false,
            success : true
        })

    } catch (error) {
       return response.status(500).json({
            message : error.message || error,
            success : false,
            error : true
       }) 
    }
}