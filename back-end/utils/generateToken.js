//generate jwt token
const jwt = require('jsonwebtoken')

const generateToken = (userId) => {
    return jwt.sign(
        //creates token contain ID and validation date
        {id:userId},
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    )
}

module.exports = generateToken