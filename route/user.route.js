import { Router } from 'express'
import { 
    forgotPasswordController, 
    loginController, 
    logoutController, 
    refreshToken, 
    registerUserController, 
    resetpassword, 
    updateUserDetails, 
    uploadAvatar, 
    userDetails, 
    verifyEmailController, 
    verifyForgotPasswordOtp , 
    registerAsSellerController
} from '../controllers/user.controller.js'
import auth from '../middleware/auth.js'
import upload from '../middleware/multer.js'

const userRouter = Router()

// User registration and verification
userRouter.post('/register',registerUserController) // Register a new user
userRouter.post('/verify-email',verifyEmailController) // Verify user email

// User login and logout
userRouter.post('/login',loginController)// Login user
userRouter.get('/logout',auth,logoutController)// Logout user (requires authentication)

// User profile management (requires authentication)
userRouter.put('/upload-avatar',auth,upload.single('avatar'),uploadAvatar)// Upload profile avatar
userRouter.put('/update-user',auth,updateUserDetails)// Update user details

// Password reset
userRouter.put('/forgot-password',forgotPasswordController)// Initiate forgot password process
userRouter.put('/verify-forgot-password-otp',verifyForgotPasswordOtp)// Verify forgot password OTP
userRouter.put('/reset-password',resetpassword)// Reset password

// Refresh access token
userRouter.post('/refresh-token',refreshToken)

// Get user details (requires authentication)
userRouter.get('/user-details',auth,userDetails)

// Register as seller (requires authentication)
userRouter.put('/register-as-seller',auth,registerAsSellerController)


export default userRouter