/**
 * Frontend Logic for the Application
 */

// Container for the frontend application
const app = {};

app.config = {
    'sessionToken': false,
};

// AJAX Client (for the result APqI)
app.client = {}

// Interface for making API calls

app.client.request = function (headers, path, method, queryStringObject, payload, callback) {

    // Set defaults
    headers = typeof headers === 'object' && headers !== null ? headers : {};
    path = typeof path === 'string' ? path : '/';
    method = typeof method === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].includes(method) ? method.toUpperCase() : 'GET';
    queryStringObject = typeof queryStringObject === 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof payload === 'object' && payload !== null ? payload : {};
    callback = typeof callback === 'function' ? callback : false;
    const searchParams = new URLSearchParams();
    Object.keys(queryStringObject).forEach(item => searchParams.append(item, queryStringObject[item]))

    // For each query string parameter sent, and it to the path
    const requestUrl = path + '?' + searchParams;
    const xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    // For each header sent, add it to the request
    Object.keys(headers).forEach(item => xhr.setRequestHeader(item, headers[item]));

    // If there is a current session set, add that as a header
    if (app.config.sessionToken) {
        xhr.setRequestHeader("token", app.config.sessionToken.id);
    }

    // When the request comes back, handle the response

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const statusCode = xhr.status;
            const responseReturned = xhr.responseText;

            // Callback if requested
            if (callback) {
                try {
                    const parsedResponse = JSON.parse(responseReturned);
                    callback(statusCode, parsedResponse);
                } catch (e) {
                    callback(statusCode, false);
                }
            }
        }
    }
// Send the payload as JSON
    const payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
}

// Bind the logout button
app.bindLogoutButton = function () {
    document.getElementById('logoutButton').addEventListener('click', function (e) {
        // Stop it from redirecting anywhere
        e.preventDefault();

        // Log the user out
        app.logUserOut();
    })
}

// Log the user out then redirect them
app.logUserOut = function () {
    // Get the current token id
    const tokenId = typeof app.config.sessionToken.id === 'string' ? app.config.sessionToken.id : false;

    // Send the current token to the tokens endpoint
    const queryStringObject = {
        id: tokenId
    };
    app.client.request(undefined, '/api/tokens', 'DELETE', queryStringObject, undefined, function () {
        // Set the app.config token as false
        app.setSessionToken(false);

        // Send the user to the logged out page
        window.location = '/session/deleted';

    })
}

app.bindForms = function () {
    if (!document.querySelector('form')) {
        return false;
    }
    document.querySelectorAll('form').forEach(item => {
        item.addEventListener('submit', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const formId = this.id;
            const path = this.action;
            let method = this.method.toUpperCase();
            const formData = new FormData(document.querySelector('form'))

            const payload = {}
            for (const [key, value] of formData.entries()) {
                if(key === '_method') {
                    method = value;
                    continue;
                }
                if (key === 'tosAgreement') {
                    payload[key] = true;
                } else {
                    payload[key] = value;
                }
            }

            // Call the API
            app.client.request(undefined, path, method, undefined, payload, function (statusCode, responsePayload, requestPayload) {
                if (statusCode !== 200) {
                    console.log('error');
                } else {
                    app.formResponseProcessor(formId, payload, responsePayload)
                }
            })
        })
    })
}

// Form response processor
app.formResponseProcessor = function (formId, requestPayload, responsePayload) {
    const functionToCall = false;
    if (formId === 'accountCreate') {
        // Take the phone and password, and use it to log the user in
        const newPayload = {
            phone: requestPayload.phone,
            password: requestPayload.password,
        };

        app.client.request(undefined, '/api/tokens', 'POST', undefined, newPayload, function (newStatusCode, newResponsePayload) {
            // Display an error on the form if needed
            if (newStatusCode !== 200) {
                // Set the fromError field with the error text

                // Show (unhide) the form error field on the form
            } else {
                // If successful, set the token and redirect the user
                console.log({newResponsePayload})
                app.setSessionToken(newResponsePayload);
                window.location = '/checks/all';
            }
        })
    }

    // If login was successful, set the token in localstorage and redirect the user
    if (formId === 'sessionCreate') {
        app.setSessionToken(responsePayload);
        console.log({responsePayload})
        // window.location = '/checks/all';
    }

    // If forms saved successfully and they have success messages, show them
    const formsWithSuccessMessages = ['accountEdit1', 'accountEdit2'];
    if(formsWithSuccessMessages.indexOf(formId) > -1){
        document.querySelector("#"+formId+" .formSuccess").style.display = 'block';
    }
}

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function () {
    const tokenString = localStorage.getItem('token');
    console.log({tokenString})
    if (typeof tokenString === 'string') {
        try {
            const token = JSON.parse(tokenString);
            app.config.sessionToken = token;
            if (typeof token === "object") {
                app.setLoggedInClass(true);
            } else {
                app.setLoggedInClass(false);
            }
        } catch (e) {
            app.config.sessionToken = false;
            app.setLoggedInClass(false);
        }
    }
}

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function (add) {
    console.log({add})
    const target = document.querySelector('body');
    if (add) {
        target.classList.add('loggedIn');
    } else {
        target.classList.remove('loggedIn');
    }
}

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = function (token) {
    app.config.sessionToken = token;
    const tokenString = JSON.stringify(token);
    localStorage.setItem('token', tokenString);
    if (typeof token === 'object') {
        app.setLoggedInClass(true);
    } else {
        app.setLoggedInClass(false)
    }
}

// Renew the token
app.renewToken = function (callback) {
    const currentToken = typeof app.config.sessionToken === 'object' ? app.config.sessionToken : false;
    if (currentToken) {
        // update the token with a new expiration
        const payload = {
            id: currentToken.id,
            extend: true,
        }
        app.client.request(undefined, '/api/token', 'PUT', undefined, payload, function (statusCode, responsePayload) {
            // Display an error on the form if needed
            if (statusCode === 200) {
                app.setSessionToken(responsePayload);
                callback(false);
            } else {
                app.setSessionToken(false);
                callback(true);
            }
        });
    } else {
        app.setSessionToken(false);
        callback(true)
    }
}

// Load data on the page
app.loadDataOnPage = function () {
    // Get the current page from the body class
    const bodyClasses = document.querySelector('body').classList;
    const primaryClass = typeof bodyClasses[0] === "string" ? bodyClasses[0] : false;

    // Logic for account settings page
    if(primaryClass === 'accountEdit') {
        app.loadAccountEditPage();
    }
};

// Load the account edit page specifically
app.loadAccountEditPage = function (){
    // Get the phone number from the current token, or log the user out if none is there
    const phone = typeof app.config.sessionToken.phone === 'string' ? app.config.sessionToken.phone : false;
    if(phone) {
        // Fetch the user data
        const queryStringObject = {
            phone: phone,
        };
        app.client.request(undefined,'/api/users','GET',queryStringObject,undefined,function(statusCode,responsePayload){
            console.log({statusCode})
            if(statusCode === 200) {
                // Put the data into the forms as values where needed
                document.querySelector('#accountEdit1 .firstNameInput').value = responsePayload.firstName;
                document.querySelector('#accountEdit1 .lastNameInput').value = responsePayload.lastName;
                document.querySelector('#accountEdit1 .displayPhoneInput').value = responsePayload.phone;

                // Put the hidden phone field into both froms
                const hiddenPhoneInputs = document.querySelectorAll('input.hiddenPhoneNumberInput');
                Array.from(hiddenPhoneInputs).forEach(item => {
                    item.value =  responsePayload.phone
                })
            } else {
                // If the request comes back as something other 200, log the user our (on the assumption that the api
                // is temporarily down or the users token is bad)
                app.logUserOut();
            }
        });
    } else {
        app.logUserOut();
    }
 }

// Loop to renew token often

app.tokenRenewalLoop = function () {
    setInterval(function () {
        app.renewToken(function (err) {
            if (!err) {
                console.log("Token renewed successfully @ " + Date.now())
            }
        })
    }, 1000 * 60)
}

// Init (bootstrapping)
app.init = function () {
    // Bind all form submissions
    app.bindForms();

    // Bind logout logout button
    app.bindLogoutButton();

    // Get the token from localstorage
    app.getSessionToken();

    // Renew token
    app.tokenRenewalLoop();

    // Load data on page
    app.loadDataOnPage();
};

// Call the init processes after the window loads
window.onload = function () {
    app.init();
}