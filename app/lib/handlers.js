/**
 * Request handlers
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define the handlers
const handlers = {};

// Users
handlers.users = function (data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.includes(data.method)) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405)
    }
}

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function (data, callback) {
    // Check that all required fields are fill out
    const firstName = typeof (data.payload.firstName) === 'string'
    && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof (data.payload.lastName) === 'string'
    && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof (data.payload.phone) === 'number'
    && String(data.payload.phone).trim().length === 10 ? String(data.payload.phone).trim() : false;
    const password = typeof (data.payload.password) === 'string'
    && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof (data.payload.tosAgreement) === "boolean"
        && data.payload.tosAgreement === true;
    console.log({firstName, lastName, phone, password, tosAgreement})

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesnt already exist
        _data.read('user', phone, function (err, data) {
            if (err) {
                console.log(err)
                // Hash the password
                const hashPassword = helpers.hash(password);
                if (hashPassword) {
                    const userObject = {
                        firstName,
                        lastName,
                        phone,
                        hashPassword,
                        tosAgreement: true
                    }
                    // Store the user
                    _data.create('users', phone, userObject, function (err) {
                        if (!err) {
                            callback(200)
                        } else {
                            console.log(err);
                            callback(500, {'Error': 'Could not create the new user'})
                        }
                    })
                } else {
                    callback(500, {'Error': 'Could not hash the user\'s password'})
                }
            } else {
                // User already exist
                callback(400, {'Error': 'A user with that phone number already exist'})
            }
        })
    } else {
        callback(400, {"Error": "Missing required fields"})
    }
}

// Users - get
// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object. Don't let them access anyone else's
handlers._users.get = function (data, callback) {
    // Check that the phone number is valid
    const phone = typeof (data.queryStringObject.phone) === 'string'
    && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    console.log({data, phone})
    if (phone) {
        // Lookup the user
        _data.read('users', phone, function (err, data) {
            if (!err && data) {
                // Remove the hashed password from the user object before returning it to the requester
                delete data.hashPassword;
                callback(200, data);
            } else {
                callback(404)
            }
        })
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// TODO Only let an authenticated user update their own object. Don't let update anyone else's
handlers._users.put = function (data, callback) {
    // Check for the required field
    const phone = typeof (data.payload.phone) === 'number'
    && String(data.payload.phone).trim().length === 10 ? String(data.payload.phone).trim() : false;
    // Check for the optional fields
    const firstName = typeof (data.payload.firstName) === 'string'
    && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof (data.payload.lastName) === 'string'
    && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof (data.payload.password) === 'string'
    && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    // Error if the phone is invalid
    if (phone) {
        // Error if nothing is send to update
        if (firstName || lastName || password) {
            // Lookup the user
            _data.read('users', phone, function (err, userData) {
                if (!err && userData) {
                // Update the fields necessary
                    if(firstName) {
                        userData.firstName = firstName;
                    }
                    if(lastName) {
                        userData.lastName = lastName;
                    }
                    if(password) {
                        userData.hashPassword = helpers.hash(password);
                    }
                    // Store the new updates
                    _data.update('users', phone, userData, function (err) {
                        if(!err) {
                            callback(200)
                        } else {
                            console.log(err);
                            callback(500, {'Error': 'Could not update the user'})
                        }
                    })

                } else {
                    callback(400, {'Error': 'The specified user does not exist'})
                }

            })
        } else {
            callback(400, {'Error': 'Missing fields to update'})
        }
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

// Users - delete
// Required field: phone
// TODO Only let an authenticated user delete their object. Don't let them delete anyone
// TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = function (data, callback) {
 // Check that phone number is valid
    const phone = typeof (data.queryStringObject.phone) === 'string'
    && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;

    if (phone) {
        // Lookup the user
        _data.read('users', phone, function (err, data) {
            if (!err && data) {
                _data.delete('users', phone, function (err) {
                    if(!err) {
                        callback(200);
                    } else {
                        callback(500, {'Error': 'Could not delete the specified user'});
                    }
                })
            } else {
                callback(400, {'Error': 'Missing required field'})
            }
        })
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}
// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
}

// Ping handler
handlers.ping = function (data, callback) {
    callback(200);
};

module.exports = handlers;