/**
 *  Primary file for the API
 */

// Dependencies
const http = require('http');
const url = require('url');

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

    // Send the response
    res.end('Hello World\n');
    // Log the request path
    console.log(`Request received with these headers: `, headers);
})

// Start the server, and have it listen on port 3000
server.listen(3000, function () {
    console.log('The Server is listening on port 3000 now');
})