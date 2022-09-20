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

app.bindForms = function () {
    if(!document.querySelector('form')) {
        return false;
    }
    document.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const formId = this.id;
        const path = this.action;
        const method = this.method.toUpperCase();
        const formData = new FormData(document.querySelector('form'))

        const payload = {}
        for (const [key, value] of formData.entries()) {
            if(key === 'tosAgreement') {
                payload[key] = true;
            } else {
                payload[key] = value;
            }
        }
        console.log({formId})

        // Call the API
        app.client.request(undefined,path, method, undefined,payload, function (statusCode,responsePayload, requestPayload) {
            if(statusCode !== 200) {
                console.log('error');
            } else {
                app.formResponseProcessor(formId, requestPayload, responsePayload)
            }
        })
    })
}

// Form response processor
app.formResponseProcessor = function (formId, requestPayload, responsePayload) {
    const functionToCall = false;
    console.log({formId})
    if(formId === 'accountCreate'){
       // Take the phone and password, and use it to log the user in
        const newPayload = {
            phone: responsePayload.phone,
            password: responsePayload.password,
        };

        app.client.request(undefined, 'api/tokens', 'POST', undefined, newPayload, function (newStatusCode, newResponsePayload) {
            // Display an error on the form if needed
            if(newStatusCode !== 200) {
                // Set the fromError field with the error text

                // Show (unhide) the form error field on the form
            } else {
                // If successful, set the token and redirect the user
                app.setSessionToken(newResponsePayload);
                window.location = '/checks/all';
                console.log({newResponsePayload})
            }
        })
    }

    // If login was successful, set the token in localstorage and redirect the user
    if(formId === 'sessionCreate'){
        app.setSessionToken(responsePayload);
        window.location = '/checks/all';
    }
}

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function () {
    const tokenString = localStorage.getItem('token');
    if(typeof tokenString === 'string') {
        try {
            const token = JSON.parse(tokenString);
            app.config.sessionToken = token;
            if(typeof  token === "object") {
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
    const target = document.querySelector('body');
    if(add) {
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
    if(typeof token === 'object') {
        app.setLoggedInClass(true);
    } else {
        app.setLoggedInClass(false)
    }
}

// Renew the token
app.renewToken = function (callback) {
    const currentToken = typeof app.config.sessionToken === 'object' ? app.config.sessionToken : false;
    if(currentToken) {
        // update the token with a new expiration
        const payload = {
            id: currentToken.id,
            extend: true,
        }
        app.client.request(undefined,'api/token', 'PUT', undefined, payload, function (statusCode, responsePayload) {
            // Display an error on the form if needed
            if(statusCode === 200) {
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

// Loop to renew token often

app.tokenRenewalLoop = function () {
    setInterval(function () {
        app.renewToken(function (err) {
            if(!err) {
                console.log("Token renewed successfully @ "+Date.now())
            }
        })
    }, 1000 * 60)
}

// Init (bootstrapping)
app.init = function () {
    app.bindForms();
};

// Call the init processes after the window loads
window.onload = function () {
    app.init();
}