const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';// MongoDB connection URL
const ExpressError = require("./utilis/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");// For authentication
const LocalStrategy = require("passport-local");// For authentication strategy
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");




const sessionOptions = {
    secret: "thisshouldbeasecret",  // 🔐 Used to sign and verify session cookies
    resave: false,                  // ✅ Don't save session again if nothing changed
    saveUninitialized: true,        // 💾 Save new sessions that haven't been modified
    cookie: {                       // 🍪 Cookie options
        httpOnly: true,             // 🔒 Prevent client-side JavaScript from accessing the cookie
        expires: Date.now() + 7 * 24 * 60 * 60 * 100, // set expiration date to one week from now
        maxAge: 7 * 24 * 60 * 60 * 100 // 📅 Set max age to one week in milliseconds

    }

};


app.use(session(sessionOptions)); // 🛡️ Initialize session middleware with options
app.use(flash()); // 🪄 Initialize flash middleware for session-based messages


app.use(passport.initialize()); // 🛡️ Initialize Passport for authentication
app.use(passport.session()); // 🛡️ Use Passport session for persistent login sessions

passport.use(new LocalStrategy(User.authenticate())); // 🛡️ Use local strategy for authentication
passport.serializeUser(User.serializeUser()); // 🛡️ Serialize user for session storage
passport.deserializeUser(User.deserializeUser()); // 🛡️ Deserialize user from session storage

app.use((req, res, next) => {   
    res.locals.success = req.flash("success"); // 🌟 Store success messages in res.local  
    res.locals.error = req.flash("error");     // 🌟 Store error messages in res.local
    res.locals.currentUser = req.user;        // 🌟 Store current user in res.local
    next(); // 🔄 Call the next middleware in the stack
}
);


main().then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
})
async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));







app.get("/home", (req, res) => {
    res.send("Im Root");
});


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);






app.use((req, res, next) => {

    next(new ExpressError(404, "Page Not Found"));
});


app.use((err, req, res, next) => {
    console.log(err.stack);

    let { statusCode = 500, message = "INVALID" } = err;
    res.status(statusCode).render("error.ejs", { statusCode, message });
});

app.listen(8080, () => {
    console.log("Listen on Port 8080");

});