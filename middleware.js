const ExpressError = require("./utilis/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Listing = require("./models/listing.js");

module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to perform this action!");
        return res.redirect("/login");
    }
    next();
};

module.exports.isCustomer = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== 'customer') {
        req.flash("error", "You must be logged in as a customer to perform this action!");
        return res.redirect("/listings");
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isVerified = async (req, res, next) => {
    if (!req.user) { // All Thanks Passport-local
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
     //If isVerified = false → !false = true → user is not verified, so the app blocks access

     //     If isVerified = true → !true = false → user is verified → allowed to proceed
    if (!req.user.isVerified) { 
        req.flash("error", "Please verify your email before logging in.");
        return res.redirect(`/verify?email=${req.user.email}&userType=${req.user.role || 'user'}`);
    }
    
    next();
};
