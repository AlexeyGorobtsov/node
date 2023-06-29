/*
* Library that demonstrate something throwing when it's init() is called
* */

// Container for the module
const example = {};

// Init function
example.init = function () {
    // This is an error created intentionally (bar is not defined)
    const foo = bar;

}


// Export the module
module.exports = example;