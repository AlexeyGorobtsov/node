/**
 * Example VM
 * Running some arbitrary commands
 */

// Dependencies
const vm = require('vm');

// Define a context for the script to run in
const context = vm.createContext({
    foo: 25
});

// Define the script
const script = new vm.Script(`
foo = foo * 2;
let bar = foo + 1;
let fizz = 52; 
`);

// Run the script
script.runInContext(context);
console.log(context)