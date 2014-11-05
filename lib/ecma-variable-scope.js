// Load in our dependencies
var ecmaScopes = require('ecma-scopes');
var estraverse = require('estraverse');

// Define our variable scope function
function ecmaVariableScope(ast) {
  // Walk entire tree
  var scopeStack = [];
  var scope;
  estraverse.traverse(ast, {
    // Upon entry of a node
    enter: function (node, parent) {

      // If it is a a program, lexical scope, with statement, or block scope
      var isNewScope = node.type === 'Program';
      isNewScope = isNewScope || ecmaScopes.lexical.indexOf(node.type) !== -1;
      isNewScope = isNewScope || node.type === 'WithStatement';
      isNewScope = isNewScope || ecmaScopes.block.indexOf(node.type) !== -1;
      if (isNewScope) {
        // Generate a new scope and push it onto our stack
        // TODO: Consider adding a child reference after we generate a new scope
        var oldScope = scope;
        scope = {
          parent: oldScope
        };
        scopeStack.push(scope);

        // Save the scope to our node
        // TODO: This smells funny... {`FunctionDeclaration.scope === FunctionDeclaration`
        node.scope = scope;
      // Otherwise
      } else {
        // Save a reference to it as scope
        node.scope = scope;
      }
    },
    // Upon exiting a node
    exit: function (node, parent) {
      // If it is a program, lexical scope, with statement, or a block scope
        // Pop it from the stack
        // Update the scope reference
    }
  });

  // Walk entire tree
    // If the item is a variable declaration
    // TODO: Be sure to cover all the bases (function, arguments, catch, etc)
      // Walk its declarators and save a reference to their declaration
      // Save declaration info on scope info

  // Walk entire tree
    // Pick out identifiers
      // Jump to scope alterer
      // While we have a scopr alterer
        // If it contains our variable
          // Stop looping
        // Jump to parent scope alterer
      // If there is a scope alterer
        // Collect declaration info and save to identifier
      // If name is not found, mark as undeclared

  // TODO: What about with?
  // TODO: How about we consider is part of the `(A/B)` blocks in the first part
}

// Export our funtion
module.exports = ecmaVariableScope;
