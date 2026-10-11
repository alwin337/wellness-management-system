//connects mongodb and export db connection
const mongoose = require('mongoose')

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Connected")
    } catch (error) {
        console.error("connection failed",error.message)
        process.exit(1)
    }
}

module.exports = connectDB