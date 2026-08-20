import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";
import mongoose from "mongoose";

/**
 * Calculates the discounted price of a product
 */
export const pricewithDiscount = (price, dis = 1) => {
  const discountAmount = Math.ceil((Number(price) * Number(dis)) / 100);
  return Number(price) - Number(discountAmount);
};

/**
 * Cash On Delivery Controller
 */
export async function CashOnDeliveryOrderController(request, response) {
  try {
    const userId = request.userId;
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    const payload = list_items.map((el) => ({
      userId: userId,
      orderId: `ORD-${new mongoose.Types.ObjectId()}`,
      productId: el.productId._id,
      product_details: {
        name: el.productId.name,
        image: el.productId.image,
        seller: el.productId.seller,
        deliveryOptions: el.productId.category[0]?.deliveryOptions,
        price: pricewithDiscount(el.productId.price, el.productId.discount),
      },
      paymentId: "",
      payment_status: "CASH ON DELIVERY",
      delivery_address: addressId,
      subTotalAmt: subTotalAmt,
      totalAmt: totalAmt,
      quantity: el.quantity,
    }));

    const generatedOrder = await OrderModel.insertMany(payload);

    // Update stock
    for (const orderItem of generatedOrder) {
      await ProductModel.findByIdAndUpdate(orderItem.productId, {
        $inc: { stock: -orderItem.quantity },
      });
    }

    // Clear cart
    await CartProductModel.deleteMany({ userId: userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

    return response.json({
      message: "Order successfully placed",
      error: false,
      success: true,
      data: generatedOrder,
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
 * Handles Web Stripe Checkout Session
 */
export async function paymentController(request, response) {
  try {
    const userId = request.userId;
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    const user = await UserModel.findById(userId);

    const line_items = list_items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.productId.name,
          images: Array.isArray(item.productId.image) ? item.productId.image : [item.productId.image],
          metadata: {
            productId: item.productId._id.toString(),
            seller: item.productId.seller?.toString() || "",
          },
        },
        unit_amount: pricewithDiscount(item.productId.price, item.productId.discount) * 100,
      },
      quantity: item.quantity,
    }));

    const params = {
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        userId: userId.toString(),
        addressId: addressId ? addressId.toString() : "",
        subTotalAmt: subTotalAmt.toString(),
        totalAmt: totalAmt.toString(),
      },
      line_items: line_items,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    };

    const session = await Stripe.checkout.sessions.create(params);

    return response.status(200).json(session);
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

/**
 * Handles Native Mobile PaymentIntent Creation
 */
export async function mobilePaymentController(request, response) {
  try {
    const userId = request.userId;
    const { totalAmt, addressId, subTotalAmt } = request.body;

    const user = await UserModel.findById(userId);

    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    const paymentIntent = await Stripe.paymentIntents.create({
      amount: Math.round(Number(totalAmt) * 100),
      currency: "inr",
      payment_method_types: ["card"],
      receipt_email: user.email,
      metadata: {
        userId: userId.toString(),
        addressId: addressId ? addressId.toString() : "",
        subTotalAmt: subTotalAmt.toString(),
        totalAmt: totalAmt.toString(),
      },
    });

    return response.status(200).json({
      message: "Payment intent created successfully",
      client_secret: paymentIntent.client_secret,
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
 * Helper: Processes order insertion and cart cleanup
 */
const processOrderAndClearCart = async ({ userId, addressId, subTotalAmt, totalAmt, paymentId, paymentStatus }) => {
  // Fetch cart items at the moment of payment completion
  const cartItems = await CartProductModel.find({ userId }).populate("productId");

  if (!cartItems || cartItems.length === 0) {
    console.log(`No cart items found for user ${userId}`);
    return;
  }

  const orderPayload = cartItems.map((item) => ({
    userId,
    orderId: `ORD-${new mongoose.Types.ObjectId()}`,
    productId: item.productId._id,
    product_details: {
      name: item.productId.name,
      image: item.productId.image,
      seller: item.productId.seller,
      deliveryOptions: item.productId.category?.[0]?.deliveryOptions || "",
      price: pricewithDiscount(item.productId.price, item.productId.discount),
    },
    paymentId: paymentId,
    payment_status: paymentStatus,
    delivery_address: addressId,
    quantity: item.quantity,
    subTotalAmt: Number(subTotalAmt),
    totalAmt: Number(totalAmt),
  }));

  const orders = await OrderModel.insertMany(orderPayload);

  // Deduct Stock
  for (const orderItem of orders) {
    await ProductModel.findByIdAndUpdate(orderItem.productId, {
      $inc: { stock: -orderItem.quantity },
    });
  }

  // Clear Cart
  await CartProductModel.deleteMany({ userId });
  await UserModel.findByIdAndUpdate(userId, { shopping_cart: [] });
};

/**
 * Webhook Handler
 */
export async function webhookStripe(request, response) {
  const sig = request.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY;

  let event;

  try {
    event = Stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Signature Verification Error: ${err.message}`);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const { userId, addressId, subTotalAmt, totalAmt } = session.metadata;

      await processOrderAndClearCart({
        userId,
        addressId,
        subTotalAmt,
        totalAmt,
        paymentId: session.payment_intent,
        paymentStatus: session.payment_status === "paid" ? "PAID" : session.payment_status,
      });
      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;

      // Ignore payment intents created by Checkout sessions to avoid duplicate orders
      if (paymentIntent.invoice || paymentIntent.metadata?.type === "checkout") {
        break;
      }

      const { userId, addressId, subTotalAmt, totalAmt } = paymentIntent.metadata;

      if (!userId) {
        console.error("Missing userId in PaymentIntent metadata");
        break;
      }

      await processOrderAndClearCart({
        userId,
        addressId,
        subTotalAmt,
        totalAmt,
        paymentId: paymentIntent.id,
        paymentStatus: "PAID",
      });
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return response.status(200).json({ received: true });
}

/**
 * Orders Retrieval Controllers
 */
export async function getOrderDetailsController(request, response) {
  try {
    const userId = request.userId;
    const orderlist = await OrderModel.find({ userId }).sort({ createdAt: -1 }).populate("delivery_address");

    return response.json({
      message: "order list",
      data: orderlist,
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

export async function getAllOrders(request, response) {
  try {
    const { page = 1, limit = 10, status } = request.query;
    const skip = (page - 1) * limit;

    const query = status ? { orderStatus: status } : {};

    const orderList = await OrderModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("delivery_address")
      .populate({ path: "product_details.seller", select: "name email" })
      .populate({ path: "userId", select: "name email" });

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

export async function getSellerOrders(request, response) {
  try {
    const { sellerId } = request.body;

    const orders = await OrderModel.find({ "product_details.seller": sellerId })
      .populate("delivery_address")
      .populate({ path: "userId", select: "name email" });

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

export const updateOrderStatus = async (request, response) => {
  try {
    const { orderId, orderStatus } = request.body;

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    return response.status(200).json({
      message: "Order status updated successfully",
      error: false,
      success: true,
      data: order,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};