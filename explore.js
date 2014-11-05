var rocambole = require('rocambole');
var functionToString = require('function-to-string');

var program = functionToString(function () {
  console.log('sup');
}.toString()).body;

console.log(program);


// Walk entire tree
  // If the item is a lexical or block scope (A)
    // Walk its subtree
      // If we encounter a new scope identifier (B)
        // Save a reference to the parent scope (A)
        // and do not recurse
      // Otherwise, save a reference to the parent scope (A)
        // TODO: Consolidated with other save reference with a statement at the start

// Walk entire tree
  // If the item is a variable declaration
  // TODO: Be sure to cover all the bases (function, arguments, catch, etc)
    // Walk its declarators and save a reference to their declaration

// Walk entire tree
  // Pick out identifiers
    // Jump to scope alterer
      // If name isn't found, keep on jumping up
      // If name is found, collect declaration info
      // If name is not found, mark as undeclared

// TODO: What about with?
// TODO: How about we consider is part of the `(A/B)` blocks in the first part

// TODO: Is the second section necessary?
// TODO: Probably note
