const ExpressError = require("./utilis/ExpressError.js");
const Listing = require("./models/listing.js");
const { listingSchema } = require("./schema.js"); // 🌟 Import the listing schema for validation
const { reviewSchema } = require("./schema.js"); // 🌟 Import the user schema for validation
const Review = require("./models/review.js"); // 🌟 Import the review model

module.exports. isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { // 🌟 Check if the user is authenticated
        req.session.redirectUrl = req.originalUrl; // 🌟 Store the original URL in localStorage
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
}; // 🔄 Call the next middleware in the stack

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) { // 🌟 Check if there is a saved redirect URL in localStorage
        res.locals.redirectUrl = req.session.redirectUrl; // 🌟 Store the redirect URL in res.local
        //delete req.session.redirectUrl; // 🌟 Clear the saved redirect URL from localStorage
    }
    next(); // 🔄 Call the next middleware in the stack
};

module.exports.isOwner = async (req, res, next) => {  
    const { id } = req.params; // 🌟 Get the listing ID from the request parameters
    const listing = await Listing.findById(id); // 🌟 Find the listing by ID
    if (!listing) { // 🌟 If the listing is not found
        req.flash("error", "Listing not found!");
        return res.redirect("/listings"); // 🌟 Redirect to the listings page
    }
    if (!listing.owner.equals(req.user._id)) { // 🌟 Check if the logged-in user is the owner of the listing
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listings/${id}`); // 🌟 Redirect to the listing's page
    }
    next(); // 🔄 Call the next middleware in the stack
};
module.exports. validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports. validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewID } = req.params; // 🌟 Get listing ID and review ID
    const review = await Review.findById(reviewID); // ✅ Use the Review model to find the review
    if (!review.author.equals(res.locals.currentUser._id)) { // 🔐 Check if user is the author
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listings/${id}`); // 🔁 Redirect if not authorized
    }
    next(); // ✅ Move to the next middleware
};
