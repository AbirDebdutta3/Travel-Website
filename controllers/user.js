const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const { checkEmailExists } = require("../utilis/emailCheck.js");
const { validateEmail } = require("../utilis/emailValidation.js");
const { generateOTP, sendOTPEmail } = require("../utilis/otpUtils");

module.exports.renderSignUpForm =  (req, res) => { 
   // res.send("User Profile Page");
   res.render("./users/signup.ejs");
};

module.exports.signUp= async (req, res, next) => {
   try {
      let { username, email, password } = req.body;
      
      // Validate email format
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
         req.flash("error", emailValidation.message);
         return res.redirect("/signup");
      }

      // Check if email exists in User model only
      const existingUser = await User.findOne({ email });
      if (existingUser) {
         req.flash("error", "This email is already registered as an owner. Please use a different email.");
         return res.redirect("/signup");
      }

      // Generate OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const newUser = new User({ 
         email, 
         username,
         otp,
         otpExpiry,
         isVerified: false
      });
      
      const registeredUser = await User.register(newUser, password);

      // Send OTP email
      const emailSent = await sendOTPEmail(email, otp);
      if (!emailSent) {
         await User.findByIdAndDelete(registeredUser._id);
         req.flash("error", "Failed to send verification email. Please try again.");
         return res.redirect("/signup");
      }

      // Redirect to verification page
      res.redirect(`/verify?email=${email}&userType=user`);
   } catch (err) {
      console.error(err);
      req.flash("error", "Something went wrong. Please try again. " + err.message);
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
        req.flash("success", "Welcome Back To Yatra Vibe");
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