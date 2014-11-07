// Load in our dependencies
var assert = require('assert');
var ecmaScopes = require('ecma-scopes');
var estraverse = require('estraverse');

// Define helper to check a new scope
function getScopeType(node) {
  if (node.type === 'Program') {
    return 'program';
  } else if (ecmaScopes.lexical.indexOf(node.type) !== -1) {
    return 'lexical';
  } else if (node.type === 'WithStatement') {
    return 'with';
  } else if (ecmaScopes.block.indexOf(node.type) !== -1) {
    return 'block';
  } else {
    return null;
  }
}

// TODO: Consider breaking down ecmaVariableScope into 3 functions

// Define our variable scope function
function ecmaVariableScope(ast) {
  // Walk entire tree
  var scopeStack = [];
  var scope;
  estraverse.traverse(ast, {
    // Upon entry of a node
    enter: function (node, parent) {
      // Save the scope to our node
      // e.g. {`FunctionDeclaration.nearestScope === Program`}
      // e.g. {`Program.nearestScope === undefined`}
      node.nearestScope = scope;

      // If it is a a program, lexical scope, with statement, or block scope
      var scopeType = getScopeType(node);
      if (scopeType) {
        // Generate a new scope and push it onto our stack
        // TODO: Consider adding a child reference after we generate a new scope
        var oldScope = scope;
        scope = {
          type: scopeType,
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
      if (getScopeType(node)) {
        // Pop it from the stack
        scopeStack.pop();

        // Update the scope reference
        scope = scopeStack[scopeStack.length - 1];
      }
    }
  });

  // Walk entire tree
  estraverse.traverse(ast, {
    enter: function (node, parent) {
      // If the item is a variable declaration
      var identifiers = [];
      var scopeType;
      switch(node.type) {
        // Lexical/block scope
        // If it is a variable declaration (e.g. `var name;`, `let name;`)
        case 'VariableDeclaration':
          // Find all of the identifiers via the declarators
          var declarators = node.declarations;
          // TODO: Consider using _.pluck
          identifiers = declarators.map(function getIdentifier (declarator) {
            return declarator.id;
          });
          // TODO: Is `const` lexical or block?
          scopeType = node.kind === 'let' ? 'block' : 'lexical';
          break;

        // Lexical scopes
        // TODO: Cover `FunctionDeclaration` -> `function name() {}`
        // TODO: Cover `FunctionExpression` -> `[].map(function name () {})`
        // TODO: Cover `ArrowFunctionExpression` -> `[].map(name => 1);
        // TODO: Cover arguments -> `function (name) {}`
        // TODO: Create todo regarding `rest...` arguments

        // Block scopes
          // TODO: Cover `ForStatement` -> `for (let name; false; false);`
          // TODO: Cover `ForInStatement` -> `for (let name in obj);`
          // TODO: Cover `ForInStatement` -> `for (let name of arr);`
          // TODO: Cover `CatchClause` -> `try { /* ... */ } catch (name) { /* ... */ }
          // TODO: Create todo regarding `ComprehensionBlock`

      }

      // If we resolved identifiers
      // DEV: This assert is to make it faster for developers to debug
      assert(Array.isArray(identifiers), 'Identifier resolution for node "' + node.type + '" did not result in an array');
      if (identifiers.length) {
        // Walk up the nearest scopes until we find one that matches our type
        // TODO: Make sure that `nearestScope` can be a self reference for things like `ForStatement`
        var scope = node.nearestScope;
        while (scope) {
          // If the scope type matches or we have reached `program`, stop
          if (scope.type === scopeType || scope.type === 'program') {
            break;
          }

          // Look at the scope's parent
          scope = scope.parent;
        }

        // Save declaration info on the scope
        identifiers.forEach(function saveIdentifier (identifier) {
          scope[identifier.name] = identifier;
        });
      }
    }
  });

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
  // TODO: Deal with with in last loop
}

// Export our funtion
module.exports = ecmaVariableScope;
