/**
 * Server-related tasks
 */

// Dependencies
const http = require('http');
const https = require('https');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('../config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
const util = require('util');
const debug = util.debuglog('server');

// Instantiate the server module object
const server = {};


// Instantiate the HTTP server
server.httpServer = http.createServer(function (req, res) {
    server.unifiedServer(req, res);
})

// Instantiate the HTTPS server
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, function (req, res) {
    server.unifiedServer(req, res);
})

// All the server logic for both the http and https server
server.unifiedServer = function (req, res) {
// Get the URL and parse it
    const url = new URL('https://' + req.headers.host + req.url);
    // Get the path
    const path = url.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    const queryStringObject = Object.fromEntries(new URLSearchParams(url.search));

    // Get the headers as an object
    const headers = req.headers;

    // Get the method
    const method = req.method.toLowerCase();

    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });

    req.on('end', function () {
        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found, use the notFound handler
        let chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined'
            ? server.router[trimmedPath]
            : handlers.notFound;

        // If the request is within the public directory, use the public handler instead
        chosenHandler = trimmedPath.includes('public/') ? handlers.public : chosenHandler;

        // Construct the data object to send to the handler
        const data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer),
        }

        // Route the request to the handler specified in the router
        try{
            chosenHandler(data, function (statusCode, payload, contentType) {
                server.processHandlerResponse(res, method, trimmedPath, statusCode, payload, contentType);

            })
        } catch (e) {
            debug(e);
            server.processHandlerResponse(res, method, trimmedPath, 500, {'Error': 'An unknown error has occured'}, 'json')
        }
    });
}


// Process the response from the handler
server.processHandlerResponse = function (res, method, trimmedPath, statusCode,payload, contentType) {
    // Determine the request to the handler specified in the router
    contentType = typeof contentType === 'string' ? contentType : 'json';
    // Use the status code called back by the handler, or default to 200
    statusCode = typeof (statusCode) === 'number' ? statusCode : 200;

    // Return the response-parts that are content-specific
    let payloadString = '';
    if(contentType === 'json') {
        res.setHeader('Content-Type', 'application/json');
        // Use the payload called back by the handler, or default to an empty object
        payload = typeof (payload) === 'object' ? payload : {};
        // Convert the payload to a string
        payloadString = JSON.stringify(payload);
    }
    if(contentType === 'html') {
        res.setHeader('Content-Type', 'text/html');
        payloadString = typeof payload === 'string' ? payload : '';
    }
    if(contentType === 'favicon') {
        res.setHeader('Content-Type', 'image/x-icon');
        payloadString = typeof payload !== 'undefined' ? payload : '';
    }
    if(contentType === 'css') {
        res.setHeader('Content-Type', 'text/css');
        payloadString = typeof payload !== 'undefined' ? payload : '';
    }
    if(contentType === 'png') {
        res.setHeader('Content-Type', 'image/png');
        payloadString = typeof payload !== 'undefined' ? payload : '';
    }
    if(contentType === 'jpg') {
        res.setHeader('Content-Type', 'image/jpeg');
        payloadString = typeof payload !== 'undefined' ? payload : '';
    }
    if(contentType === 'plain') {
        res.setHeader('Content-Type', 'text/plain');
        payloadString = typeof payload !== 'undefined' ? payload : '';
    }

    // Return the response-parts that are common to all content-types
    res.writeHead(statusCode);
    res.end(payloadString);

    // If the response is 200, print green otherwise print red
    if (statusCode === 200) {
        debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
    } else {
        debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
    }
    debug(`Returning this response: `, statusCode, payloadString);
}

// Define a request router
server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted': handlers.sessionDeleted,
    'checks/all': handlers.checksList,
    'checks/create': handlers.checksCreate,
    'checks/edit': handlers.checksEdit,
    'ping': handlers.ping,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks,
    'favicon.ico': handlers.favicon,
    'public': handlers.public,
    'examples/error': handlers.exampleError
}

// Init script

server.init = function () {

    // Start the HTTP SERVER
    server.httpServer.listen(config.httpPort, function () {
        console.log('\x1b[36m%s\x1b[0m', `The Server is listening on port ${config.httpPort} in ${config.envName} now`);
    });

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, function () {
        console.log('\x1b[35m%s\x1b[0m', `The Server is listening on port ${config.httpsPort} in ${config.envName} now`);
    });
}

// Export the module
module.exports = server;
