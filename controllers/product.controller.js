import ProductModel from "../models/product.model.js";
import productRejectTemplate from "../utils/productRejectTemplate.js";
import productApproveTemplate from "../utils/productApproveTemplate.js"

/**
 * Creates a new product and saves it to the database.
 */
export const createProductController = async(request,response)=>{
    try {
        const { 
            name ,
            image ,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
            seller,
            status,
            rejectReason
        } = request.body 

        if(!name || !image[0] || !category[0] || !subCategory[0] || !unit || !price || !description ||!seller){
            return response.status(400).json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }

        const product = new ProductModel({
            name ,
            image ,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
            seller,
            status : 'pending',
            rejectReason : null
        })
        const saveProduct = await product.save()

        return response.json({
            message : "Product Created Successfully",
            data : saveProduct,
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
 * Retrieves a list of products from the database.
 */
export const getProductController = async(request,response)=>{
    try {
        
        let { page, limit, search } = request.body 

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        const query = search ? {
            $text : {
                $search : search
            }
        } : {}

        const skip = (page - 1) * limit

        const [data,totalCount] = await Promise.all([
            ProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limit).populate('category subCategory'),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            totalCount : totalCount,
            totalNoPage : Math.ceil( totalCount / limit),
            data : data
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
 * Retrieves a list of products created by a specific seller.
 */
export const getProductBySeller = async(request , response)=> {
    try{
        const { sellerId , page , limit  } = request.body

        if(!sellerId) {
            return response.status(400).json({
                message : "Seller ID is required.",
                error : true,
                success : false
            })
        }

        if (!page) {
            page = 1;
        }
      
        if (!limit) {
            limit = 12;
        }

        const skip = (page - 1) * limit;
      
        const [data, totalCount] = await Promise.all([
            ProductModel.find({ seller: sellerId })
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limit)
              .populate('category subCategory'),
            ProductModel.countDocuments({ seller: sellerId}),
        ]);
      
        return response.json({
            message: "Products retrieved successfully.",
            error: false,
            success: true,
            totalCount,
            totalNoPage: Math.ceil(totalCount / limit),
            data,
        
        });
    } catch (error) {
          return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}


/**
 * Retrieves a list of products from a specific category.
 */
export const getProductByCategory = async(request,response)=>{
    try {
        const { id ,filters, page, limit } = request.body 

        if(!id){
            return response.status(400).json({
                message : "provide category id",
                error : true,
                success : false
            })
        }

        if (!page) {
            page = 1;
        }
      
        if (!limit) {
            limit = 15;
        }

        let query = { category: { $in: id } };

        
        if (filters && filters.rating.length > 0) {
            query.averageRating = { $gte: Math.min(...filters.rating) }; 
        }
  
      
        if (filters && filters.discount.length > 0) {
            query.discount = { $gte: Math.min(...filters.discount) };
        }
  
        let sortOption = {createdAt : -1};
        if(filters && filters.sortBy){
            if (filters.sortBy === 'price-asc') {
                sortOption = { price: 1 };
            } else if (filters.sortBy === 'price-desc') {
                sortOption = { price: -1 };
            } 
        }
        

        const skip = (page - 1) * limit;

        const [data, dataCount] = await Promise.all([
            ProductModel.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(limit),
            ProductModel.countDocuments(query),
        ]);

        return response.json({
            message: "category product list",
            data: data,
            totalCount: dataCount,
            page: page,
            limit: limit,
            success: true,
            error: false,
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
 * Retrieves a list of products from a specific category and subCategory
 */
export const getProductByCategoryAndSubCategory  = async(request,response)=>{
    try {
        const { categoryId,subCategoryId,page,limit,filters} = request.body

        if(!categoryId || !subCategoryId){
            return response.status(400).json({
                message : "Provide categoryId and subCategoryId",
                error : true,
                success : false
            })
        }

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        const query = {
            category : { $in :categoryId  },
            subCategory : { $in : subCategoryId }
        }

        if (filters && filters.rating.length > 0) {
            query.averageRating = { $gte: Math.min(...filters.rating) }; 
        }
  
      
        if (filters && filters.discount.length > 0) {
            query.discount = { $gte: Math.min(...filters.discount) };
        }
  
        let sortOption = {createdAt : -1};
        if(filters && filters.sortBy){
            if (filters.sortBy === 'price-asc') {
                sortOption = { price: 1 };
            } else if (filters.sortBy === 'price-desc') {
                sortOption = { price: -1 };
            } 
        }

        const skip = (page - 1) * limit

        const [data,dataCount] = await Promise.all([
            ProductModel.find(query).sort(sortOption).skip(skip).limit(limit),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product list",
            data : data,
            totalCount : dataCount,
            page : page,
            limit : limit,
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

export const getProductDetails = async(request,response)=>{
    try {
        const { productId } = request.body 

        const product = await ProductModel.findOne({ _id : productId })
        .populate({
            path: 'reviews',
            options: { limit: 5 }, 
          }).populate({
            path: 'category',
            select : 'name deliveryOptions'
          })
        .select('-__v'); 


        return response.json({
            message : "product details",
            data : product,
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

//update product
export const updateProductDetails = async(request,response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide product _id",
                error : true,
                success : false
            })
        }

        const product = await ProductModel.findById(_id);

        if (!product) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false,
            });
        }

        // Check if the current user is the seller of the product
        if (product.seller.toString() !== request.userId) { 
            return response.status(403).json({
                message: "You are not authorized to update this product.",
                error: true,
                success: false,
            });
        }

        const updateProduct = await ProductModel.updateOne({ _id : _id },{
            ...request.body
        })

        return response.json({
            message : "updated successfully",
            data : updateProduct,
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

//delete product
export const deleteProductDetails = async(request,response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide _id ",
                error : true,
                success : false
            })
        }

        const product = await ProductModel.findById(_id);

        if (!product) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false,
            });
        }

        // Check if the current user is the seller or an admin
        /*if (product.seller.toString() !== request.userId && request.user.role !== 'ADMIN') { 
            return response.status(403).json({
                message: "You are not authorized to delete this product.",
                error: true,
                success: false,
            });
        }*/

        const deleteProduct = await ProductModel.deleteOne({_id : _id })

        return response.json({
            message : "Deleted successfully",
            error : false,
            success : true,
            data : deleteProduct
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//search product
export const searchProduct = async(request,response)=>{
    try {
        let { search, page , limit } = request.body 

        if(!page){
            page = 1
        }
        if(!limit){
            limit  = 10
        }

        const query = search ? { 
            $or: [
                { name: { $regex: new RegExp(search, 'i') } }, 
                 
            ] 
        } : {}; 

        const skip = ( page - 1) * limit

        const [data,dataCount] = await Promise.all([
            ProductModel.find(query).sort({ createdAt  : -1 }).skip(skip).limit(limit).populate('category subCategory'),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            data : data,
            totalCount :dataCount,
            totalPage : Math.ceil(dataCount/limit),
            page : page,
            limit : limit 
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
 * Admin approves a product for selling and an email is sent for approval
 */
export const approveProduct = async(request , response) =>{

    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide product Id ",
                error : true,
                success : false
            })
        }

        const product = await ProductModel.findById(_id);
    
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
    
        product.status = 'approved';
        await product.save();

        await sendEmail({
            sendTo : email,
            subject : "Product approved for Selling on QuickBuy",
            html : productApproveTemplate({
                seller : product.seller.name,
                name : product.name,
            })
        })
    
        return response.json({
            message : "product approved successfully",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : 'error',
            error : true,
            success : false
        })
    }
}

/**
 * Admin rejects a product for selling and an email is sent for rejection
 */
export const rejectProduct = async(request , response) =>{

    try {
        const { _id , rejectReason} = request.body 

        if(!_id && !rejectReason){
            return response.status(400).json({
                message : "provide product Id and a reject message",
                error : true,
                success : false
            })
        }

        const product = await ProductModel.findById(_id);
    
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
    
        product.status = 'rejected';
        product.rejectReason = rejectReason;
        await product.save();

        await sendEmail({
            sendTo : email,
            subject : "Product rejected for Selling on QuickBuy",
            html : productRejectTemplate({
                seller : product.seller.name,
                name : product.name,
                message : rejectReason
            })
        })
    
        return response.json({
            message : "product rejected",
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