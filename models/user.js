const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");// For adding username and password fields to the schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    }
});

userSchema.plugin(passportLocalMongoose )// Adds username and password fields to the schema

module.exports = mongoose.model("User", userSchema);// Exports the User model based on the userSchema