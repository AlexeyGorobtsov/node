/**
 * Helpers for various task
 */

// Dependencies
const crypto = require('crypto');
const config = require('../config')
// Container for all the helpers

const helpers = {};

// Create a SHA256 hash
helpers.hash = function (str){
    if(typeof(str) === 'string' && str.length > 0) {
        return crypto.createHmac('sha256', config.hashingSecrete).update(str).digest('hex');
    } else {
        return false;
    }
}

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function (str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return {};
    }
}

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function (strLength) {
    strLength = typeof(strLength) === 'number' ? strLength : false;
    if(strLength) {
        // Define all the possible characters that could go into a string
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
       // Start the final string
        let str = '';
        for (let i = 1; i <= strLength; i++) {
             // Get a random character from the possible Characters string
            let randomCharacter = possibleCharacters.charAt((Math.floor(Math.random() * possibleCharacters.length)))
            // Append this character to the final string
            str+=randomCharacter;
        }
        // Return the final string
        return str;
    } else {
        return false
    }
}


module.exports = helpers;