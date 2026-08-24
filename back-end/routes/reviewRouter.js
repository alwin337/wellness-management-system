const express = require("express")

const router = express.Router()

const {
    createReview,
    getCounsellorReviews,
} = require("../controllers/reviewController")

const protect = require("../middleware/authMiddleware")

//student submit review
router.post(
    "/",
    protect,
    createReview
)

router.get(
    "/counsellor",
    protect,
    getCounsellorReviews
)

module.exports = router