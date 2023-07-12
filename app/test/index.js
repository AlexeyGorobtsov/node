/**
 * Test runner
 */

// Application logic for the test runner
_app = {};

// Container for the tests
_app.tests = {};

// Add on the unit tests
_app.tests.unit = require('./unit');

// Count all the tests
_app.countTests = function () {
    let counter = 0;
    for (let key in _app.tests) {
        if(_app.tests.hasOwnProperty(key)) {
            let subTests = _app.tests[key];
            for (let testName in subTests) {
                if(subTests.hasOwnProperty(testName)) {
                    counter++
                }
            }
        }
    }
    return counter;
}

// Run all the tests, collecting the errors and successes
_app.runTests = function () {
    const errors = [];
    let successed = 0;
    let limit = _app.countTests();
    let counter = 0;
    for (let key in _app.tests) {
        if(_app.tests.hasOwnProperty(key)) {
            const subTests = _app.tests[key];
            for (let testName in subTests) {
                if(subTests.hasOwnProperty(testName)) {
                    (function () {
                       const tmpTestName = testName;
                       const testValue = subTests[testName];
                       console.log({testValue, testName})
                       // Call the test
                        try {
                            testValue(function () {
                                // if it calls back without throwing, then it succeeded, so log it green
                                console.log('\x1b[32m%s\x1b[0m', tmpTestName);
                                counter++;
                                successed++;
                                if(counter === limit) {
                                    _app.produceTestReport(limit, successed, errors)
                                }
                            })
                        } catch (e) {
                            // If it throws, then it failed, so capture the error thrown and log it in red
                            errors.push({
                                name: testName,
                                error: e
                            });
                            console.log('\x1b[31m%s\x1b[0m', tmpTestName);
                            counter++;
                            if(counter === limit) {
                                _app.produceTestReport(limit, successed, errors)
                            }
                        }
                    })()
                }
            }
        }
    }
}

// Produce a test outcome report
_app.produceTestReport = function (limit, successes, errors) {
    console.log("");
    console.log("-----------BEGIN TEST REPORT-----------");
    console.log("");
    console.log("Total Tests: ", limit);
    console.log("Pass: ", successes);
    console.log("Fail: ", errors.length);
    console.log("");

    // If there are errors, print them in detail
    if(errors.length > 0) {
        console.log("---------BEGIN ERROR DETAILS---------");
        console.log("");

        errors.forEach((testError) => {
            console.log('\x1b[31m%s\x1b[0m', testError.name);
            console.log(testError.error);
            console.log("");
        })
        console.log("---------END ERROR DETAILS---------");
    }

    console.log("");
    console.log("---------END TEST REPORT---------");
}

// Run the tests
_app.runTests();