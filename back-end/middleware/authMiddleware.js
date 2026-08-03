//Verify JWT & Protect private routes
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async(req,res,next) => {
    try {
        let token

        const authHeader = req.headers.authorization

        if(authHeader && authHeader.startsWith("Bearer ")){
             token = authHeader.split(" ")[1]
        }

        if(!token){
            return res.status(401).json({
                message:"not authorized no token provided"
            })
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        const user = await User.findById(decoded.id).select(
            "-password"
          );

          if (!user) {
            return res.status(401).json({
              message: "User not found",
            });
          }
          req.user = user;

          next()

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
          });
    }
}

module.exports = protect