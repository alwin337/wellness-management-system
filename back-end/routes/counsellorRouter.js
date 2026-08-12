const express = require('express')
const router = express.Router()
const {addCounsellor,
  getAllCounsellors,
  getCounsellor,
  updateCounsellor,
  deleteCounsellor,} = require('../controllers/counsellorController')
const protect = require('../middleware/authMiddleware')
const {adminOnly} = require('../middleware/adminMiddleware')

router.use(protect,adminOnly)
router.get('/',protect,getAllCounsellors)
router.get('/:id',protect,getCounsellor)
router.put('/:id',protect,adminOnly,updateCounsellor)
router.post('/',protect,adminOnly, addCounsellor)

router.delete('/:id', deleteCounsellor)

module.exports = router