const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const customerSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: 'customer'
    }
});

customerSchema.plugin(passportLocalMongoose);// adds username and password fields to the schema

module.exports = mongoose.model("Customer", customerSchema); 