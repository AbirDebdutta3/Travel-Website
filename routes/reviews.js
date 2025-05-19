const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utilis/wrapAsync.js");
const { validateReview } = require("../middleware.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const reviewController = require("../controllers/review.js");

//post review route
router.post("/", validateReview, wrapAsync(reviewController.createReview));

//delete review route
router.delete("/:reviewID", wrapAsync(reviewController.destroyReview));

module.exports = router;

