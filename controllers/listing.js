const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
    const { sort } = req.query;
    let allListings;
    
    if (sort === 'price-low-to-high') {
        allListings = await Listing.find({}).populate("owner").sort({ price: 1 });
    } else if (sort === 'price-high-to-low') {
        allListings = await Listing.find({}).populate("owner").sort({ price: -1 });
    } else {
        allListings = await Listing.find({}).populate("owner");
    }
    
    res.render("./listings/index.ejs", { 
        allListings,
        currentSort: sort || 'default'
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");
    if (!listing) {
        return res.redirect("/listings");
    }
    res.render("./listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    
    const newListing = new Listing(req.body.listing);
    newListing.image = {
        url: url,
        filename: filename
    };
    newListing.owner = req.user._id;

    await newListing.save();
    res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    if (!listing) {
        return res.redirect("/listings");
    }
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to edit this listing!");
        return res.redirect(`/listings/${id}`);
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_300");

    res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.redirect("/listings");
    }
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to update this listing!");
        return res.redirect(`/listings/${id}`);
    }
    const updatedListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image = {
            url,
            filename
        };
        await updatedListing.save();
    }
    res.redirect(`/listings/${updatedListing._id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to delete this listing!");
        return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
};

module.exports.filterByCategory = async (req, res) => {
    const { category } = req.params;
    const { sort } = req.query;
    
    let listings;
    if (sort === 'price-low-to-high') {
        listings = await Listing.find({ category: category }).populate("owner").sort({ price: 1 });
    } else if (sort === 'price-high-to-low') {
        listings = await Listing.find({ category: category }).populate("owner").sort({ price: -1 });
    } else {
        listings = await Listing.find({ category: category }).populate("owner");
    }
    
    res.render("./listings/category.ejs", {
        listings,
        category,
        currentSort: sort || 'default'
    });
};