// TO make sure only admin can create/edit/delete counsellor

const adminOnly = (req,res,next) => {
    if(req.user && req.user.role === 'Admin'){
        next()
    }else{
        res.status(403).json({
            message:'Access denied'
        })
    }
}

module.exports = { adminOnly }