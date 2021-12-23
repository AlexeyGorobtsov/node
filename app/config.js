/**
 * Create and export configuration variables
 */

// Container for all the evironments
const environments = {};

// Staging (default) environment

environments.staging = {
    'port': 3000,
    'envName': 'staging',
};

// Production environment

environments.production = {
    'port': 5001,
    'envName': 'production'
};

// Detwermine which environment was passed as a command-line argument

const currentEnvironment = typeof (process.env.NODE_ENV) === 'string'
    ? process.env.NODE_ENV.toLowerCase()
    : '';

// Check that the current environment is one of the environments above, if not, default to staging

const environmantToExport = typeof (environments[currentEnvironment]) === 'object'
    ? environments[currentEnvironment]
    : environments.staging;

// Export the module

module.exports = environmantToExport;
