import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

//Establish database connection
async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDB Database Connected")
    } catch (error) {
        console.log("Mongodb connect error",error)
        process.exit(1)
    }
}

export default connectDB