/**
 *  Primary file for the API
 */

// Dependencies
const http = require('http');
const url = require('url');

// The server should respond to all requests with a string
const server = http.createServer(function (req, res) {

    // Get the URL and parse it
    const parsedUrl = url.parse(req.url, true)
    const urlN = new URL('https://' + req.headers.host + req.url);
    const pathN = urlN.pathname;
    const trimmedPathN = pathN.replace(/^\/+|\/+$/g, '');
    // Get the path
    // const path = parsedUrl.pathname;
    // const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the HTTP Method
    const method = req.method.toLowerCase();

    // Send the response
    res.end('Hello World\n');
    // Log the request path
    console.log(`Request received on path: ${trimmedPathN} with method ${method}`);
})

// Start the server, and have it listen on port 3000
server.listen(3000, function () {
    console.log('The Server is listening on port 3000 now');
})