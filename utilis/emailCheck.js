const User = require("../models/user");
const Customer = require("../models/customer");

const checkEmailExists = async (email) => {
    const userExists = await User.findOne({ email });
    const customerExists = await Customer.findOne({ email });
    
    if (userExists || customerExists) {
        return true;
    }
    return false;
};

module.exports = { checkEmailExists }; 