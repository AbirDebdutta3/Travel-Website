const express = require("express");
const router = express.Router();
const wrapAsync = require("../utilis/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn, isCustomer } = require("../middleware.js");
const customerController = require("../controllers/customer.js");

// Customer Authentication Routes
router.route("/signup")
    .get(customerController.renderSignUpForm)
    .post(wrapAsync(customerController.signUp));

router.route("/login")
    .get(customerController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate("customer", {
        failureRedirect: "/customer/login",
        failureFlash: true
    }), customerController.login);

router.get("/logout", customerController.logout);

// Booking routes
router.post("/listings/:listingId/book", isLoggedIn, isCustomer, wrapAsync(customerController.createBooking));
router.get("/bookings/:bookingId", isLoggedIn, isCustomer, wrapAsync(customerController.getBooking));
router.get("/bookings", isLoggedIn, isCustomer, wrapAsync(customerController.getUserBookings));

module.exports = router; 