import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js"
import mongoose from "mongoose";


/**
 * Calculates the discounted price of a product
 * @param {number} price - Original price of the product
 * @param {number} discount - Discount percentage (default: 1)
 * @returns {number} Discounted price
 */
export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}


/**
 * Handles Cash On Delivery orders and stock updation
 **/
 export async function CashOnDeliveryOrderController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        // Prepare order data for each item
        const payload = list_items.map(el => {
            return({
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : el.productId._id, 
                product_details : {
                    name : el.productId.name,
                    image : el.productId.image,
                    seller : el.productId.seller,
                    deliveryOptions : el.productId.category[0].deliveryOptions,
                    price : pricewithDiscount(el.productId.price,el.productId.discount)
                },
                paymentId : "",
                payment_status : "CASH ON DELIVERY",
                delivery_address : addressId ,
                subTotalAmt  : subTotalAmt,
                totalAmt  :  totalAmt,
                quantity: el.quantity,
            })
        })

        const generatedOrder = await OrderModel.insertMany(payload)
  
        // Update stock for Cash on Delivery
        for (const orderItem of generatedOrder) {
          const product = await ProductModel.findById(orderItem.productId);
          if (product) {
            product.stock -= orderItem.quantity; 
            await product.save();
          }
        }


        ///remove from the cart
        const removeCartItems = await CartProductModel.deleteMany({ userId : userId })
        const updateInUser = await UserModel.updateOne({ _id : userId }, { shopping_cart : []})

        return response.json({
            message : "Order successfully placed",
            error : false,
            success : true,
            data : generatedOrder
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

/**
 * Handles online payments using Stripe
 */ 

export async function paymentController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const user = await UserModel.findById(userId)

        const line_items  = list_items.map(item =>{
            return{
                price_data : {
                    currency : 'inr',
                    product_data : {
                        name : item.productId.name,
                        images : item.productId.image,
                        metadata : {
                            productId : item.productId._id,
                            seller : item.productId.seller,
                            deliveryOptions : item.productId.category[0].deliveryOptions,
                            price : pricewithDiscount(item.productId.price,item.productId.discount)
                        }
                    },
                    unit_amount : pricewithDiscount(item.productId.price,item.productId.discount) * 100,
                     
                },
                adjustable_quantity : {
                    enabled : true,
                    minimum : 1
                },
                quantity : item.quantity
            }
        })

        const params = {
            submit_type : 'pay',
            mode : 'payment',
            payment_method_types : ['card'],
            customer_email : user.email,
            metadata : {
                userId : userId,
                addressId : addressId,
                subTotalAmt : subTotalAmt,
                totalAmt : totalAmt
            },
            line_items : line_items,
            success_url : `${process.env.FRONTEND_URL}/success`,
            cancel_url : `${process.env.FRONTEND_URL}/cancel`

        }

        const session = await Stripe.checkout.sessions.create(params)

        return response.status(200).json(session)

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


const getOrderProductItems = async({
    lineItems,
    userId,
    addressId,
    subTotalAmt,
    totalAmt,
    paymentId,
    payment_status,
 })=>{
    const productList = []

    if(lineItems?.data?.length){
        for(const item of lineItems.data){
            const product = await Stripe.products.retrieve(item.price.product)

            const seller = product.metadata.seller;
            const deliveryOptions = product.metadata.deliveryOptions;
            const price = product.metadata.price;

            const paylod = {
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : product.metadata.productId, 
                product_details : {
                    name : product.name,
                    image : product.images,
                    seller ,
                    deliveryOptions ,
                    price 
                } ,
                paymentId : paymentId,
                payment_status : payment_status,
                delivery_address : addressId,
                quantity : item.quantity,
                subTotalAmt  : subTotalAmt,
                totalAmt  :  totalAmt ,
            }

            productList.push(paylod)
        }
    }

    return productList
}


/**
 * Processes Stripe webhook events
 */
export async function webhookStripe(request,response){
    const event = request.body;
    const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY

    console.log("event",event)

    // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
      const userId = session.metadata.userId
      const orderProduct = await getOrderProductItems(
        {
            lineItems : lineItems,
            userId : userId,
            addressId : session.metadata.addressId,
            paymentId  : session.payment_intent,
            payment_status : session.payment_status,
        })
    
      const order = await OrderModel.insertMany(orderProduct)

      // Update stock 
      for (const orderItem of order) {
        const product = await ProductModel.findById(orderItem.productId);
        if (product) {
          product.stock -= orderItem.quantity; 
          await product.save();
        }
      }

        if(Boolean(order[0])){
            const removeCartItems = await  UserModel.findByIdAndUpdate(userId,{
                shopping_cart : []
            })
            const removeCartProductDB = await CartProductModel.deleteMany({ userId : userId})
        }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}

/**
 * Retrieves order details for a specific user
 */
export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId // order id

        const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')

        return response.json({
            message : "order list",
            data : orderlist,
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
 * Retrieves all orders with optional filtering and pagination
 */
export async function getAllOrders(request, response) {
    try {
      const { page = 1, limit = 10, status } = request.query; 
      const skip = (page - 1) * limit; 
  
      const query = status ? {
        orderStatus : status
      } : {}
  
      /*if (search) {
        query.$or = [
          { 'product_details.name': { $regex: search, $options: 'i' } },
          { 'userId.name': { $regex: search, $options: 'i' } },
          { 'userId.email': { $regex: search, $options: 'i' } }, 
          { 'product_details.seller':{ $regex: search, $options: 'i'} },
          { orderId: { $regex: search, $options: 'i' } }, 
        ];
      }*/
  
      /*if (status) {
        query.orderStatus = status;

      }*/
  
      const orderList = await OrderModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('delivery_address')
        .populate({ 
            path: 'product_details.seller', 
            select: 'name email' // Select only required fields
        })
        .populate({ 
            path: 'userId', 
            select: 'name email' // Select only required fields
        });
  
      const totalOrders = await OrderModel.countDocuments(query);
  
      return response.json({
        message: "All Orders",
        data: orderList,
        totalOrders,
        currentPage: Number(page),
        totalPages: Math.ceil(totalOrders / limit),
        error: false,
        success: true,
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
 * Retrieves orders for a specific seller
 */
export async function getSellerOrders(request, response) { 
    try {
      const { sellerId } = request.body; 
  
      const orders = await OrderModel.find({ 
        "product_details.seller" : sellerId
      })
        .populate('delivery_address')
        .populate({ 
          path: 'userId', 
          select: 'name email' 
        });
  
      return response.status(200).json({
        message: "Seller Orders Retrieved Successfully",
        data: orders,
        error: false,
        success: true,
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
 * Seller can update order Status 
 */
export const updateOrderStatus = async (request , response ) => {
    try {
      const { orderId , orderStatus } = request.body;
  
      const order = await OrderModel.findById(orderId);
  
      if (!order) {
        return response.status(404).json({ 
          message: "Order not found", 
          error: true, 
          success: false 
        });
      }
  
      order.orderStatus = orderStatus; 
      await order.save();
  
      return response.status(200).json({ 
        message: "Order status updated successfully", 
        error: false, 
        success: true, 
        data: order 
      });
  
    } catch (error) {
      return response.status(500).json({ 
        message: error.message || error, 
        error: true, 
        success: false 
      });
    }
};