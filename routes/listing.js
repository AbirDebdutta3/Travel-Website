const express = require("express");
const router = express.Router();
const wrapAsync = require("../utilis/wrapAsync.js");
const { validateListing, isLoggedIn, isOwner } = require("../middleware.js");
const Listing = require("../models/listing.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

// New route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Edit route - specific route goes first
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

// Add category route before the :id routes to avoid conflicts
router.get("/category/:category", wrapAsync(listingController.filterByCategory));

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));

module.exports = router;