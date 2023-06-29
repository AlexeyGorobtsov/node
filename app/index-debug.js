/**
 *  Primary file for the API
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const exampleDebuggingProblem = require('./lib/exampleDebuggingProblem');

// Declare the app
const app = {};

app.init = function () {
    // Start the server
    debugger;
    server.init();
    debugger;

    debugger;

    // Start the workers
    workers.init();
    debugger;

    // Start the CLI, but make sure it starts last
    setTimeout(function () {
        cli.init();
    }, 50);

    debugger;

    // Set for at 1;
    let foo = 1;
    console.log('Just assigned 1 to foo')
    debugger;

    // Increment foo
    foo++;
    console.log('Just incremented')
    debugger;

    // Square foo
    foo = foo * foo;
    console.log('Just squared foo');
    debugger;

    // Convert foo to a string
    foo = foo.toString()
    console.log('Just converted foo to string')
    debugger;
    // Call the init script that will throw
    exampleDebuggingProblem.init();
    console.log('Just called the library')
    debugger;
}

// Execute
app.init();

// Export the app
module.exports = app;
