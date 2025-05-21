const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utilis/wrapAsync.js");
const { validateReview, isLoggedIn } = require("../middleware.js");
const reviewController = require("../controllers/review.js");

//post review route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//delete review route
router.delete("/:reviewID", isLoggedIn, wrapAsync(reviewController.destroyReview));

module.exports = router;

