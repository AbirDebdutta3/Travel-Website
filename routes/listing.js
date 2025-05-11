const express = require("express");
const router = express.Router();
const wrapAsync = require("../utilis/wrapAsync.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const { validateListing } = require("../middleware.js");
const Listing = require("../models/listing.js");




// Index route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({})
    res.render("./listings/index.ejs", { allListings });
}));

// New route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("./listings/new.ejs");
});

// Show route
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if (!listing) {
        req.flash("error", "Listing not found!");
       return res.redirect("/listings");
    }
    //console.log(listing);
    
    res.render("./listings/show.ejs", { listing });
}));

// Create route
router.post("/", isLoggedIn,validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);// Create a new listing using the data from the request body
    newListing.owner = req.user._id;// Assign the logged-in user's ID to the listing
    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
}));

// Edit route
router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
       return res.redirect("/listings");
    }
    res.render("./listings/edit.ejs", { listing });
}));

// Update route
router.put("/:id", isLoggedIn,isOwner,validateListing, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
    if (!listing) {
        return next(new ExpressError(404, "Listing not found"));
    }
    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${listing._id}`);
}));

// Delete route
router.delete("/:id", isLoggedIn,isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
}));

module.exports = router;