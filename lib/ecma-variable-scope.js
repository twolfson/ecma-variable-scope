// Load in our dependencies
var ecmaScopes = require('ecma-scopes');
var estraverse = require('estraverse');

// Define helper to check a new scope
function isScope(node) {
  var retVal = node.type === 'Program';
  retVal = retVal || ecmaScopes.lexical.indexOf(node.type) !== -1;
  retVal = retVal || node.type === 'WithStatement';
  retVal = retVal || ecmaScopes.block.indexOf(node.type) !== -1;
  return retVal;
}

// Define our variable scope function
function ecmaVariableScope(ast) {
  // Walk entire tree
  var scopeStack = [];
  var scope;
  estraverse.traverse(ast, {
    // Upon entry of a node
    enter: function (node, parent) {
      // Save the scope to our node
      // e.g. {`FunctionDeclaration.scope === Program`}
      // e.g. {`Program.scope === undefined`}
      node.scope = scope;

      // If it is a a program, lexical scope, with statement, or block scope
      if (isScope(node)) {
        // Generate a new scope and push it onto our stack
        // TODO: Consider adding a child reference after we generate a new scope
        var oldScope = scope;
        scope = {
          node: node, // reference to node of AST
          parent: oldScope, // reference to parent in scope tree
          identifiers: { // reference to Identifier nodes in AST under our scope
            // name: Identifier
          },
          children: [] // references to children in scope tree
        };
        scopeStack.push(scope);

        // If there was a parent scope, save a child reference
        if (scope.parent) {
          scope.parent.children.push(scope);
        }
      }
    },
    // Upon exiting a node
    leave: function (node, parent) {
      // If it is a program, lexical scope, with statement, or a block scope
      if (isScope(node)) {
        // Pop it from the stack
        scopeStack.pop();

        // Update the scope reference
        scope = scopeStack[scopeStack.length - 1];
      }
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
