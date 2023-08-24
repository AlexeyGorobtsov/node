/**
 * Example UDP Server
 * Creating a UDP datagram server listing on 6000
 */

// Dependencies
const dgram = require('dgram');

// Create a server
const server = dgram.createSocket('udp4');

server.on('message', function (messageBuffer, sender) {
    // Do something with and incoming message or do something with the sender
    const messageString = messageBuffer.toString();
    console.log(messageString);
});

// Bind to 6000
server.bind(6000);