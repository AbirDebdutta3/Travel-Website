const express = require("express");
const router = express.Router({ mergeParams: true }); // ✅ this line fixes it
const wrapAsync = require("../utilis/wrapAsync.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");// 🌟 Import the validateReview middleware
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");





//post review route
router.post("/",isLoggedIn, validateReview, wrapAsync(async (req, res) => {

    //console.log("🔥 Incoming review POST body:", req.body);

    let listing = await Listing.findById(req.params.id);
    let review = new Review(req.body.review);
     review.author = req.user._id;

    console.log("🔥 New review:", review);


    listing.reviews.push(review);

    await review.save();
    await listing.save();
    req.flash("success", "Successfully created a new review!");
    res.redirect(`/listings/${listing._id}`);

}));
//delete review route
router.delete("/:reviewID",isLoggedIn,isReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewID } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
    await Review.findByIdAndDelete(reviewID);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/listings/${id}`);
}));
module.exports = router;

