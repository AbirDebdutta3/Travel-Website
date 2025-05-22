const Customer = require("../models/customer");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const { checkEmailExists } = require("../utilis/emailCheck.js");
const { validateEmail } = require("../utilis/emailValidation.js");
const nodemailer = require("nodemailer");

module.exports.renderSignUpForm = (req, res) => {
    res.render("./customers/signup.ejs");
};

module.exports.signUp = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        
        // Validate email format
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            req.flash("error", emailValidation.message);
            return res.redirect("/customer/signup");
        }

        // Check if email exists in either User or Customer model
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            req.flash("error", "This email is already registered. Please use a different email.");
            return res.redirect("/customer/signup");
        }

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

module.exports.createBooking = async (req, res) => {
    try {
        const { listingId } = req.params;
        const { checkIn, checkOut, totalPrice } = req.body;
        
        const listing = await Listing.findById(listingId);
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        // Check if dates are available
        const existingBooking = await Booking.findOne({
            listing: listingId,
            status: { $in: ["pending", "confirmed"] },
            $or: [
                {
                    checkIn: { $lte: new Date(checkOut) },
                    checkOut: { $gte: new Date(checkIn) }
                }
            ]
        });

        if (existingBooking) {
            req.flash("error", "These dates are not available!");
            return res.redirect(`/listings/${listingId}`);
        }

        const booking = new Booking({
            customer: req.user._id,
            listing: listingId,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            totalPrice: Number(totalPrice),
            status: "confirmed"
        });

        await booking.save();

        // Add booking to listing's bookings array
        if (!listing.bookings) {
            listing.bookings = [];
        }
        listing.bookings.push(booking._id);
        await listing.save();

        // Send confirmation email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.user.email,
            subject: "Booking Confirmation - Yatra Vibe",
            html: `
                <h1>Booking Confirmation</h1>
                <p>Dear ${req.user.username},</p>
                <p>Your booking has been confirmed for ${listing.title}.</p>
                <p>Check-in: ${new Date(checkIn).toLocaleDateString()}</p>
                <p>Check-out: ${new Date(checkOut).toLocaleDateString()}</p>
                <p>Total Price: ₹${totalPrice}</p>
                <p>Thank you for choosing Yatra Vibe!</p>
            `
        };

        await transporter.sendMail(mailOptions);

        req.flash("success", "Booking confirmed! Check your email for details.");
        res.redirect("/customer/bookings");
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong with your booking!");
        res.redirect(`/listings/${req.params.listingId}`);
    }
};

module.exports.getBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId)
            .populate("listing")
            .populate("customer");
        
        if (!booking) {
            req.flash("error", "Booking not found!");
            return res.redirect("/listings");
        }

        res.render("bookings/show", { booking });
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong!");
        res.redirect("/listings");
    }
};

module.exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ customer: req.user._id })
            .populate("listing")
            .sort({ createdAt: -1 });
        
        res.render("bookings/index", { bookings });
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong!");
        res.redirect("/listings");
    }
}; 