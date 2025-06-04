if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");//	The core framework and method: passport.authenticate()
// passport as the authentication engine
// passport-local as one plug-in module for username/password login
const LocalStrategy = require("passport-local");//	A strategy for local username/password authentication: LocalStrategy
const User = require("./models/user.js");
const Customer = require("./models/customer.js");
const ExpressError = require("./utilis/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const customerRouter = require("./routes/customer.js");
const verifyRouter = require("./routes/verify.js");
const dbUrl = process.env.ATLAS_URL


main().then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret:process.env.SECRET,
    },
    touchAfter: 24 * 3600,

});

store.on ("error", ()=>{
    console.log("Error on MongoStore",err);
});

const sessionOptions = {
    store,                      // A session store (e.g., MongoDB session store)
    secret: process.env.SECRET, // Secret used to sign session ID cookies
    resave: true,              // Resave session even if nothing changed
    saveUninitialized: true,   // Save empty sessions
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // Absolute expiration
        maxAge: 7 * 24 * 60 * 60 * 1000,               // Relative expiration (7 days)
        httpOnly: true,        // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === "production",  // Only send cookie over HTTPS in production
        sameSite: 'lax'        // Protects against CSRF while allowing cross-site requests
    }
};
app.set('trust proxy', 1);

app.use(session(sessionOptions)); // Session middleware (stores login sessions)
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Configure passport strategies
passport.use(new LocalStrategy(User.authenticate()));//Default: "local" → for normal User
passport.use('customer', new LocalStrategy(Customer.authenticate()));//"customer" → for Customer model

// Serialize user
passport.serializeUser((user, done) => {
    done(null, { id: user._id, type: user.constructor.modelName }); //
});
// serializeUser = Save the user's ID and type on a little piece of paper (session cookie).
// deserializeUser = Every time the user visits, use that piece of paper to find the full user profile in your database.
// Deserialize user
passport.deserializeUser(async (data, done) => { 
    try {
        const Model = data.type === 'User' ? User : Customer;
        const user = await Model.findById(data.id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentPath = req.path;
    next();
});

app.use("/", userRouter);
app.use("/customer", customerRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", verifyRouter);


app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { statusCode, message });
});

app.listen(8080, () => {
    console.log("Listen on Port 8080");
});