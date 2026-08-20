import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import https from 'https'
import connectDB from './config/connectDB.js'
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import uploadRouter from './route/upload.router.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'
import bannerImageRouter from './route/bannerImage.route.js'
import wishlistRouter from './route/wishlist.route.js'
import reviewRouter from './route/review.router.js'


const app = express()

// Enable CORS with specific origin for enhanced security
app.use(cors({
    credentials : true,
    // origin : process.env.FRONTEND_URL
    origin : true
}))
app.use(express.json())
app.use(cookieParser())
app.use(helmet({
    // crossOriginResourcePolicy : false
}))

const PORT = process.env.PORT || 8000
const SERVER_URL = process.env.SERVER_URL

// Basic route for testing
app.get("/",(request,response)=>{
    ///server to client
    response.json({
        message : "Server is running " + PORT,
        status : "active"
    })
})

// Route definitions
app.use('/api/user',userRouter)
app.use("/api/category",categoryRouter)
app.use("/api/file",uploadRouter)
app.use("/api/subcategory",subCategoryRouter)
app.use("/api/product",productRouter)
app.use("/api/cart",cartRouter)
app.use("/api/address",addressRouter)
app.use('/api/order',orderRouter)
app.use('/api/home/bannerImage',bannerImageRouter)
app.use('/api/wishlist',wishlistRouter)
app.use('/api/review',reviewRouter)


// Keep-Alive Self-Ping Function (Runs every 10 minutes)
const keepAlive = () => {
    setInterval(() => {
        https.get(SERVER_URL, (res) => {
            console.log(`Keep-alive ping sent to ${SERVER_URL} - Status: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error('Keep-alive ping error:', err.message);
        });
    }, 10 * 60 * 1000); // 10 minutes
}

//start server
connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log("Server is running on PORT:",PORT);
        keepAlive();
    })
})

