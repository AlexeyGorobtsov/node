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

    const payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
}