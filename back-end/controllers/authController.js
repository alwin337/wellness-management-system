const User = require('../models/User')
const bcrypt = require('bcryptjs')
const generateToken = require('../utils/generateToken')

//Register Student
const registerUser = async(req,res) => {
    try {
        const {name,email,password,department} = req.body

        //check fields 
        if(!name||!email||!password){
            return res.status(400).json({
                message:"Name,email and password are required",
            })
        }

        //check if email alr exists
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({
                message:"email already exists",
            })
        }


        //hash password
        const hashPassword = await bcrypt.hash(password,10)

        //create Student
        const user = await User.create({
            name,
            email,
            password:hashPassword,
            department,
            role: "student",
        })

        res.status(201).json({
            message:"Account created successfully",
            user: {
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role,
                department:user.department,
            },
        
    })
    } catch (error) {
        res.status(500).json({
            message:"Server Adichu Poyitta",
            error:error.message,
        })
    }

}

    //LOGIN
    const loginUser = async(req,res) => {
        try {
            const {email,password} = req.body;

            if(!email||!password){
                return res.status(400).json({
                    message:"email and password are required"
                })
            }

            //find User
            const user = await User.findOne({email})

            if(!user){
                return res.status(401).json({
                    message:"invalid email or password",
                })
            }
            //Compare both password hashed one and entered password
            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            )

            if(!passwordMatch){
                return res.status(401).json({
                    message:"invalid email or password",
                })
            }

            //Generate JWT

            const token = generateToken(user._id)

            res.status(200).json({
                message:"Login successful",

                token,

                user: {
                    id:user._id,
                    name:user.name,
                    email:user.email,
                    role:user.role,
                    department:user.department,
                },
            })

        } catch (error) {
            res.status(500).json({
                message:"Server error",
                error:error.message,
            })
        }
    }

    //get the current user profile

    const getProfile =  async(req,res)=> {
        try {
            res.status(200).json({
                user: req.user,
            })
        } catch (error) {
            res.status(500).json({
                message:"Server error",
                error:error.message,
            })
        }
    }

module.exports = {
    registerUser,
    loginUser,
    getProfile,
}