/**
 *  Primary file for the API
 */

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// The server should respond to all requests with a string
const server = http.createServer(function (req, res) {

    // Get the URL and parse it
    const url = new URL('https://' + req.headers.host + req.url);
    // Get the path
    const path = url.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    const queryStringObject = url.search;

    // Get the headers as an object
    const headers = req.headers;

    // Get the method
    const method = req.method;

    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });

    req.on('end', function () {
        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found, use the notFound handler
        const chossenHandler = typeof (router[trimmedPath]) !== 'undefined'
            ? router[trimmedPath]
            : handlers.notFound;

        // Construct the data object to send to the handler
        const data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer,
        }

        // Route the request to the handler specified in the router
        chossenHandler(data, function (statusCode, payload){
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof (statusCode) === 'number' ? statusCode : 200;

            // Use the payload called back by the handler, or default to an empty object
            payload = typeof(payload) === 'object' ? payload : {};

            // Convert the payload to a string
            const payloadString = JSON.stringify(payload);

            // Return the response
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log
            console.log(`Returning this response: `, statusCode, payloadString);
        })
    });
})

// Start the server, and have it listen on port 3000
server.listen(3000, function () {
    console.log('The Server is listening on port 3000 now');
});

// Define the handlers
const handlers = {};

handlers.sample = function (data, callback) {
    // Callback a http status code, and a payload object
    callback(406, {'name': 'sample handler'});
}

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
}

// Define a request router
const router = {
    'samples': handlers.sample
}