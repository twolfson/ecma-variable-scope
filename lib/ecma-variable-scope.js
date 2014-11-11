// Load in our dependencies
var assert = require('assert');
var ecmaScopes = require('ecma-scopes');
var estraverse = require('estraverse');

// Define helper to check a new scope
function getScopeType(node) {
  if (node.type === 'Program') {
    // DEV: We mark `program` as `lexical` because it is easier to set/compare against
    return 'lexical';
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

// TODO: Move to an object or reduce the parameters. The count is too damn high
// DEV: We specify `baseNode` because it should be where we resolve the nearest scope from which may not be an identifier
function resolveScope(baseNode, identifiers, scopeType) {
  // If we resolved identifiers
  // DEV: This assert is to make it faster for developers to debug
  assert(Array.isArray(identifiers), 'Identifier resolution for baseNode "' + baseNode.type + '" did not result in an array');

  if (identifiers.length) {
    // Walk up the nearest scopes until we find one that matches our type
    var scope = baseNode.nearestScope;
    while (scope) {
      // If the scope type matches, stop
      if (scope.type === scopeType) {
        break;
      }

      // Look at the scope's parent
      scope = scope.parent;
    }

    // Save declaration info on the scope
    identifiers.forEach(function saveIdentifier (identifier) {
      scope.identifiers[identifier.name] = identifier;
    });
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
      var identifiers;
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
          // DEV: For reference, `const` is lexical
          //   if (true) { const hai = true; } console.log(hai);
          scopeType = node.kind === 'let' ? 'block' : 'lexical';
          resolveScope(node, identifiers, scopeType);
          break;

        // Lexical scopes
        // `function name(params) {}`
        case 'FunctionDeclaration':
        // `[].map(function name (params) {})`
        case 'FunctionExpression':
        // `[].map(name => 1);
        case 'ArrowFunctionExpression':
          // DEV: This covers both the function name and its parameters
          // Resolve the scope of the fn name separately from its params (different scopes)
          // DEV: Allow no name (e.g. `[].map(function () {})`
          if (node.id) {
            resolveScope(node, [node.id], 'lexical');
          }

          // Resolve scope for the fn parameters (will resolve to fn)
          if (node.params[0]) {
            resolveScope(node.params[0], node.params, 'lexical');
          }
          break;
        // TODO: Create todo regarding `rest...` arguments

        // Block scopes
          // TODO: Test `let`
          // TODO: Cover `ForStatement` -> `for (let name; false; false);`
          // TODO: Cover `ForInStatement` -> `for (let name in obj);`
          // TODO: Cover `ForInStatement` -> `for (let name of arr);`
          // TODO: Cover `CatchClause` -> `try { /* ... */ } catch (name) { /* ... */ }
          // TODO: Create todo regarding `ComprehensionBlock`
      }
    }
  });

  // Walk entire tree
  estraverse.traverse(ast, {
    enter: function (node, parent) {
      // If the node is an identifier (i.e. any variable reference)
      // TODO: Verify this doesn't tag `MemberExpression's` (e.g. `log` of `console.log`)
      if (node.type === 'Identifier') {
        // Walk up the scope chain until we find our containing scope
        var scope = node.nearestScope;
        var info = {
          declared: false,
          topLevel: false,
          insideWith: false,
          type: 'undeclared'
        };
        while (scope) {
          // If we are passing through a `with`, save the info
          if (scope.type === 'with') {
            info.insideWith = true;
          }

          // If it contains our variable, stop looping
          if (scope.identifiers[node.name] !== undefined) {
            break;
          }

          // Otherwise, move to the parent scope
          scope = scope.parent;
        }

        // If we didn't find a scope or we are at the top level, mark info as top level
        if (scope === undefined || scope.node.type === 'Program') {
          info.topLevel = true;
        }

        // If we hit a scope, save the type
        if (scope) {
          info.type = scope.type;
        }

        // If we saw a `with`, mark `declared` as unknown
        // Attribution: https://github.com/dlsym/segmentation_fuuuu/blob/0bd35fbe215c45fda75e47c3d63df7c4be76b2c6/README.md
        // WITH(OBJ)  ________
        //         __/     /  \  FFFFFFF
        //        /   \   /__  \ FFFFFFF
        //       /  ___\  | (|  \  FFFFFF
        //       | |)  |  \__/   \  FFFUU
        //       | \ _ / ____     |  UUUU
        //       |      / VVV\_   |  UUUU
        //       |     /   ~   \  |  UUUU
        //        \   /__M_M___/  |  UUUU
        //         \_____________/   UUUU-
        if (info.insideWith === true) {
          info.declared = 'unknown';
        // Otherwise, if we didn't find a scope, marked it as undeclared
        } else if (info.type === 'undeclared') {
          info.declared = false;
        // Otherwise, mark this identifier as declared
        } else {
          info.declared = true;
        }

        // Save our info to the identifier
        node.scopeInfo = info;
        node.scope = scope;
      }
    }
  });

  // Return our marked up AST
  return ast;
}

// Export our funtion
module.exports = ecmaVariableScope;
