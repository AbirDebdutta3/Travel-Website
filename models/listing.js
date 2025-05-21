const mongoose = require("mongoose");
const review = require("./review.js");

const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
      url : String,
      filename : String,
    },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
 
  price: Number,
  location: String,
  country: String,
 reviews:[{
    type: Schema.Types.ObjectId,
    ref: "Review",
  }], 
   category: {
    type: String,
    enum: ['mountains', 'farms', 'beaches', 'castles', 'camping', 'trending', 'rooms', 'iconic-cities', 'amazing-pools', 'arctic', 'dome', 'boat'] // example categories
  },     
});

listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing) {
    await review.deleteMany({
      _id: {
        $in: listing.reviews,
      },
    });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;