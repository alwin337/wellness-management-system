const User = require('../models/User')

//GET /api/users/profile
const getUserProfile = async(req,res) => {
    try {
        const user = await User.findById(req.user._id).select('-password')
        if(!user){
            return res.status(404).json({message: 'User not found'})
        }
        res.status(200).json({
        user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
    } catch (error) {
        res.status(500).json({message: 'server error retreiving profile'})
    }
}

//update user profile
//PUT /api/users/profile

const updateUserProfile = async (req,res) => {
    try {
        const user = await User.findById(req.user._id)
        if(!user){
            return res.status(404).json({message: 'User not found'})
        }

        //only these fields allow updation
        user.name = req.body.name || user.name
        user.department = req.body.department || user.department

        //prevent role modification
        if(req.body.role && req.body.role !== user.role){
            return res.status(403).json({ message: 'Action forbidden: Role cannot be modified directly.' })
        }

        const updatedUser = await user.save()
        res.json({
            message: "updated successfully",
            user: {
                _id: updatedUser._id,
                name:updatedUser.name,
                email:updatedUser.email,
                role:updatedUser.role,
                department:updatedUser.department,
            }
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error updating profile' })
    }
}

module.exports = {getUserProfile, updateUserProfile}