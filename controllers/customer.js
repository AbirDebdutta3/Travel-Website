const Customer = require("../models/customer");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

module.exports.renderSignUpForm = (req, res) => {
    res.render("./customers/signup.ejs");
};

module.exports.signUp = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newCustomer = new Customer({ email, username });
        const registeredCustomer = await Customer.register(newCustomer, password);
        req.login(registeredCustomer, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to WanderLust!");
            res.redirect(req.session.redirectUrl || "/listings");
        });
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong. Please try again. " + err.message);
        res.redirect("/customer/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("./customers/login.ejs");
};

module.exports.login = [
    saveRedirectUrl,
    passport.authenticate("customer", {
        failureRedirect: "/customer/login",
        failureFlash: true,
    }),
    (req, res) => {
        req.flash("success", "Welcome Back To Wanderlust");
        const redirectUrl = req.session.redirectUrl || "/listings";
        delete req.session.redirectUrl;
        res.redirect(redirectUrl);
    }
];

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Goodbye! See you soon!");
        res.redirect("/listings");
    });
}; 