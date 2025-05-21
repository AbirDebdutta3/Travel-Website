const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
   
});

userSchema.plugin(passportLocalMongoose);// Adds username and password fields to the schema

module.exports = mongoose.model("User", userSchema); 