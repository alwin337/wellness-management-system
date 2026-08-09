const express = require('express')
const router = express.Router()
const {addCounsellor,getAllCounsellors,getCounsellor,deleteCounsellor} = require('../controllers/counsellorController')
const protect = require('../middleware/authMiddleware')
const {adminOnly} = require('../middleware/adminMiddleware')

router.use(protect,adminOnly)

router.post('/', addCounsellor)
router.get('/',getAllCounsellors)
router.get('/:id',getCounsellor)
router.delete('/:id', deleteCounsellor)

module.exports = router