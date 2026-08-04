//define User schema
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true,
    },
    email: {
        type:String,
        required:true,
        unique:true //ensure no duplicate users
    },
    password: {
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['student','counsellor','admin'],
        default:'student'
    }

}, {timestamps:true})

module.exports = mongoose.model('User',userSchema)