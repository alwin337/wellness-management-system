const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema(
    {
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Appointment",
            required: true,
            unique: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true, 
        },
        counsellorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Counsellor",
            required: true,
        },
        reason: {
            type: String,
            trim:true,
        },
        notes: {
            type: String,
            trim:true,
        },
        feedback: {
            type: String,
            trim:true,
            default:"",
        },
        feedbackSent: {
            type:Boolean,
            default:false,
        },

        sessionDate: {
            type: Date,
            default:Date.now,
        },
    },
    {
        timestamps:true,
    }
    
)

module.exports = mongoose.model("Session", sessionSchema);
