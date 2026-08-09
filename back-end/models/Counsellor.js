//counsellor specific information

const mongoose = require('mongoose')

const counsellorSchema = new mongoose.Schema({
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    specialization: {
        type: String,
        required:true
    },
    contactNumber: {
        type:String,
        required:true,
    }
}, {timestamps:true})

module.exports = mongoose.model('Counsellor',counsellorSchema)