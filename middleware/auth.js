import jwt from 'jsonwebtoken'

/**
 * Middleware to authenticate user based on JWT token in request.
*/

const auth = async(request,response,next)=>{
    try {

        // Check for access token in cookies or authorization header
        const token = request.cookies.accessToken || request?.headers?.authorization?.split(" ")[1]
       
        if(!token){
            return response.status(401).json({
                message : "Please Log In First ..."
            })
        }
        
        // Verify the access token using the secret key
        const decode = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN)


        if(!decode){
            return response.status(401).json({
                message : "unauthorized access",
                error : true,
                success : false
            })
        }

        // Attach user ID to the request object for further use
        request.userId = decode.id

        next()  // Proceed to the next middleware/route handler

    } catch (error) {

        // Handle potential errors during token verification
        return response.status(500).json({
            message : "You have not logedIn",///error.message || error,
            error : true,
            success : false
        })
    }
}

export default auth