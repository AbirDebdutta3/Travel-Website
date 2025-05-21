const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

module.exports.renderSignUpForm =  (req, res) => { 
   // res.send("User Profile Page");
   res.render("./users/signup.ejs");
};

module.exports.signUp= async (req, res) => {
   try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      req.login(registeredUser, (err) => {
         if (err) {
            return next(err);
         }
         req.flash("success", "Welcome to WanderLust!");
         res.redirect(req.session.redirectUrl || "/listings"); // Redirect to the saved URL or default to "/listings"
      });
   } catch (err) {
      console.error(err);
      req.flash("error", "Something went wrong. Please try again. " , err.message);
      res.redirect("/signup");
   }
};

module.exports.renderLoginForm =  (req,res)=>{
   res.render("./users/login.ejs");
};

module.exports.login = [
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    (req, res) => {
        req.flash("success", "Welcome Back To Wanderlust");
        // Only redirect to saved URL if it exists and is a GET route
        const redirectUrl = req.session.redirectUrl || "/listings";
        delete req.session.redirectUrl;
        res.redirect(redirectUrl);
    }
];

module.exports.logout = (req, res,next) => {
   req.logout((err) => {
      if (err) {
         return next(err);
      }
      req.flash("success", "Goodbye! See you soon!");
      res.redirect("/listings");
   });
}