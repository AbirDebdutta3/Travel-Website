const express = require("express");
const router = express.Router();
const wrapAsync = require("../utilis/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

// Owner Authentication Routes
router.route("/signup")
    .get(userController.renderSignUpForm)
    .post(wrapAsync(userController.signUp));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }), userController.login);

router.get("/logout", userController.logout);

// Email verification route
router.get("/verify-email/:token", wrapAsync(userController.verifyEmail));

module.exports = router; 