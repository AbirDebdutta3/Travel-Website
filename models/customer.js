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
    }
});

customerSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Customer", customerSchema); 