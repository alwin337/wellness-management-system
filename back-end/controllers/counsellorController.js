const User = require('../models/User')
const Counsellor = require('../models/Counsellor')
const bcrypt = require('bcryptjs') 


// Add a New Counsellor (Admin Only)
// POST /api/admin/counsellors

const addCounsellor = async(req,res) => {
    try {
        const {
            name,
            email,
            password,
            specialization,
            contactNumber,
        } = req.body

        const userExists = await User.findOne({email})
        
        if(userExists){
            return res.status(400).json({
                message: 'Account already exists'
            })
        }

        //hash password
        const salt= await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //create counsellor user Account
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'Counsellor'
        })

        //counsellor profile
        const counsellor = await Counsellor.create({
            user: user._id,
            specialization,
            contactNumber,
        })

        res.status(201).json({
            message:"Counsellor created Successfully",

            counsellor: {
                id:counsellor._id,
                name:user.name,
                email:user.email,
                specialization:counsellor.specialization,
            }
        })

    } catch (error) {
        res.status(500).json({
            message:'Error creating counsellor profle'
        })
    }
}

//get all counsellors
// /api/admin/counsellors(GET)

const getAllCounsellors = async (req,res) => {
    try {
        const counsellors = await Counsellor.find().populate('user','name email role')
        res.json(counsellors)
    } catch (error) {
        res.status(500).json({
            message: 'Server error fetching counsellors'
        })
    }
}
//get a single counsellor

const getCounsellor = async(req,res) => {
    try {
        const counsellor = await Counsellor.findById(req.params.id).populate('user', 'name email')
        if(!counsellor){
            return res.status(404).json({
                message: 'Counsellor record not found'
            })
        }
        res.status(200).json({
            counsellor,
        })
    } catch (error) {
        res.status(500).json({
        message: "Server error retrieving counsellor",
        error: error.message,
    })
    }
}

//delete a counsellor
// /api/admin/counsellors/:id(DELETE)
const deleteCounsellor = async (req,res) => {
    try {
        const counsellor = await Counsellor.findById(req.params.id)
        if(!counsellor){
            return res.status(404).json({
                message: 'Counsellor record not found'
            })
        }

        //Delete both the login User record and the counsellor profile
        await User.findByIdAndDelete(counsellor.user)
        await Counsellor.findByIdAndDelete(req.params.id)
    } catch (error) {
        res.status(500).json({
            message:'error while removing counsellor'
        })
    }
}

module.exports = {addCounsellor,getAllCounsellors,getCounsellor,deleteCounsellor}

