module.exports = function wrapAsync(fn) {
    return function (req, res, next) {
      fn(req, res, next).catch(next);
    };
  };
  

//Takes an async function fn (like a controller).

//Returns a new function that:

//Executes fn(req, res, next)

//If it throws an error (via .catch), it automatically passes the error to next() → so Express handles it.

//This function is a utility used in Express.js to handle errors in async route handlers without writing repetitive try...catch blocks.