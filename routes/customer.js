const express = require("express");
const router = express.Router();
const wrapAsync = require("../utilis/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
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

module.exports = router; 