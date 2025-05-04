class ExpressError extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
};

module.exports = ExpressError;
// This code defines a custom error class called ExpressError that extends the built-in Error class in JavaScript.  