const express = require ("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const MONGO_URL ='mongodb://127.0.0.1:27017/wanderlust';
const wrapAsync = require("./utilis/wrapAsync.js");
const ExpressError = require("./utilis/ExpressError.js");
const {listingSchema} = require("./schema.js");
const Review = require("./models/review.js");
const {reviewSchema} = require("./schema.js");

 main().then(()=>{
    console.log("connected to DB");
 }).catch((err)=>{
    console.log(err);
 })
async function main(){
    await mongoose.connect(MONGO_URL);
} 
    
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


  
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
 


app.get("/home", (req,res)=>{
    res.send("Im Root");
});


//index route
app.get("/listings", wrapAsync(async(req,res)=>{
   const allListings =  await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
}));

//new route
app.get("/listings/new", (req,res)=>{   
  res.render("./listings/new.ejs");
});

//show route
app.get("/listings/:id",wrapAsync( async(req,res)=>{
    const {id}= req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("./listings/show.ejs", {listing});
}));
//create route
app.post("/listings",
    validateListing,
    wrapAsync( async(req,res)=>{
   const newListing = new Listing(req.body.listing);
    await newListing.save();    
    res.redirect("/listings");
}));
//edit route
app.get("/listings/:id/edit", wrapAsync(async(req,res)=>{
    const {id}= req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", {listing});
}));
//update route
// app.put("/listings/:id", wrapAsync(async(req,res)=>{
//     const {id}= req.params;
//     const listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
//     if (!listing || !listing._id) {
//         throw new ExpressError(404, "Listing not found or update failed.");
//     }
//     res.redirect(`/listings/${listing._id}`);  
//}));

app.put("/listings/:id",
    validateListing,
    wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
    if (!listing) {
        return next(new ExpressError(404, "Listing not found"));
    }
    res.redirect(`/listings/${listing._id}`);
}));


//delete route
app.delete("/listings/:id", wrapAsync(async(req,res)=>{
    const {id}= req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

//review route
//post review route
app.post("/listings/:id/reviews",validateReview, wrapAsync(async(req,res)=>{

    //console.log("🔥 Incoming review POST body:", req.body);

    let listing = await Listing.findById(req.params.id);
    let review = new Review(req.body.review);
     
    listing.reviews.push(review);
    await review.save(); 
    await listing.save();
    res.redirect(`/listings/${listing._id}`);

}));
//delete review route
app.delete("/listings/:id/reviews/:reviewID", wrapAsync(async(req,res)=>{
    const {id, reviewID} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewID}});
    await Review.findByIdAndDelete(reviewID);
    res.redirect(`/listings/${id}`);
}));



// app.get("/test", (req, res) => {

// app.get("/testListing", async (req, res) => {
//       let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//       });
    
//       await sampleListing.save();
//       console.log("sample was saved");
//       res.send("successful testing");
//     });


// app.all("*",(req, res, next)=>{
//     //console.log("Page Not Found");
//     next(new ExpressError(404, "Page Not Found"));
// });

app.use((req, res, next)=>{
    //console.log("Page Not Found");
    next(new ExpressError(404, "Page Not Found"));
});


app.use((err, req, res, next) => {
    let {statusCode =500, message= "INVALID"} = err;
   res.status(statusCode).render("error.ejs",{statusCode, message});
});

app.listen (8080,()=>{
    console.log("Listen on Port 8080");
    
});