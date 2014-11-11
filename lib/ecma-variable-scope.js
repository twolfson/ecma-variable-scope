// Load in our dependencies
var assert = require('assert');
var ecmaScopes = require('ecma-scopes');
var estraverse = require('estraverse');

// Define constants
var SCOPE_INFO_DECLARED = {
  YES: true,
  UNKNOWN: 'unknown',
  NO: false
};
var SCOPE_INFO_INSIDE_WITH = {
  YES: true,
  NO: false
};
var SCOPE_INFO_TOP_LEVEL = {
  YES: true,
  NO: false
};
var SCOPE_INFO_TYPES = {
  LEXICAL: 'lexical',
  BLOCK: 'block',
  UNDECLARED: 'undeclared'
};
var SCOPE_TYPES = {
  LEXICAL: 'lexical',
  WITH: 'with',
  BLOCK: 'block'
};

// Define helper to check a new scope
function getScopeType(node) {
  if (node.type === 'Program') {
    // DEV: We mark `program` as `lexical` because it is easier to set/compare against
    return SCOPE_TYPES.LEXICAL;
  } else if (ecmaScopes.lexical.indexOf(node.type) !== -1) {
    return SCOPE_TYPES.LEXICAL;
  } else if (node.type === 'WithStatement') {
    return SCOPE_TYPES.WITH;
  } else if (ecmaScopes.block.indexOf(node.type) !== -1) {
    return SCOPE_TYPES.BLOCK;
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
    // DEV: Use `scopeTypes` since a block scope can hit `Program` which is lexical
    var scope = baseNode._nearestScope;
    var scopeTypes = scopeType === SCOPE_INFO_TYPES.LEXICAL ? [SCOPE_INFO_TYPES.LEXICAL] : [SCOPE_INFO_TYPES.LEXICAL, SCOPE_INFO_TYPES.BLOCK];
    while (scope) {
      // If the scope type matches, stop
      if (scopeTypes.indexOf(scope.type) !== -1) {
        break;
      }

      // Look at the scope's parent
      scope = scope.parent;
    }

    // Expand all identifiers (e.g. object patterns to variables, `var {world}` -> `world`)
    var expandedIdentifiers = [];
    identifiers.forEach(function expandIdentifier (identifier) {
      // If it is an object pattern, expand it and save each key/identifier
      if (identifier.type === 'ObjectPattern') {
        identifier.properties.forEach(function extractObjectIdentifier (property) {
          expandedIdentifiers.push(property.key);
        });
      // Otherwise if it is an array pattern, expand it and save each identifier
      } else if (identifier.type === 'ArrayPattern') {
        identifier.elements.forEach(function extractArrayIdentifier (element) {
          expandedIdentifiers.push(element);
        });
      // Otherwise, save the original identifier
      } else {
        expandedIdentifiers.push(identifier);
      }
    });

    // Save declaration info on the scope and scope type to the identifier
    expandedIdentifiers.forEach(function saveIdentifier (identifier) {
      scope.identifiers[identifier.name] = identifier;
      identifier._scopeType = scopeType;
    });
  }
}

// TODO: Consider breaking down ecmaVariableScope into 3 functions

// Define our variable scope function
// DEV: This function goes in 3 parts
//   1. Generate a scope chain (e.g. `FunctionDeclaration` -> `FunctionDeclaration` -> `Program`)
//   2. Resolve variable declarations to their closest scope
//        (e.g. `function hello(world) {}` maps `world` to the scope of `hello`)
//   3. Match all identifiers to their corresponding scope and add info
//        (e.g. `function a() { var x; function b() { x(); } }` gives `x` the properties recorded against `a`)
function ecmaVariableScope(ast) {
  // Walk entire tree
  var scopeStack = [];
  var scope;
  estraverse.traverse(ast, {
    // Upon entry of a node
    enter: function (node, parent) {
      // Save the scope to our node
      // e.g. {`FunctionDeclaration._nearestScope === Program`}
      // e.g. {`Program._nearestScope === undefined`}
      node._nearestScope = scope;

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
        // DEV: This also covers `for/for in/for of` loops since they require a `let`
        case 'VariableDeclaration':
          // Find all of the identifiers via the declarators
          var declarators = node.declarations;
          // TODO: Consider using _.pluck
          identifiers = declarators.map(function getIdentifier (declarator) {
            return declarator.id;
          });
          // DEV: For reference, `const` is lexical
          //   if (true) { const hai = true; } console.log(hai);
          scopeType = node.kind === 'let' ? SCOPE_INFO_TYPES.BLOCK : SCOPE_INFO_TYPES.LEXICAL;
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
            resolveScope(node, [node.id], SCOPE_INFO_TYPES.LEXICAL);
          }

          // Resolve scope for the fn parameters (will resolve to fn)
          if (node.params[0]) {
            resolveScope(node.params[0], node.params, SCOPE_INFO_TYPES.LEXICAL);
          }
          break;

        // Block scopes
        // `try { /* ... */ } catch (name) { /* ... */ }
        case 'CatchClause':
          resolveScope(node.param, [node.param], SCOPE_INFO_TYPES.BLOCK);
          break;
        // `var a = [1 for (value of ['hello'])];`
        case 'ComprehensionBlock':
          resolveScope(node.left, [node.left], SCOPE_INFO_TYPES.BLOCK);
          break;
      }
    }
  });

  // Walk entire tree
  estraverse.traverse(ast, {
    // Skip over undesired identifiers (e.g. `log` in `console.log`)
    // https://github.com/Constellation/estraverse/blob/1.7.0/estraverse.js#L222-L288
    keys: {
      BreakStatement: [/*'label'*/], // `loop1` in `break loop1;`
      ContinueStatement: [/*'label'*/], // `loop1` in `continue loop1;`
      LabeledStatement: [/*'label',*/ 'body'], // `loop1` in `loop1: while (true) {}`
      MemberExpression: ['object'/*, 'property'*/], // `log` in `console.log`
      Property: [/*'key',*/ 'value'] // `key` in `{key: 'value'}`
    },

    // For each identifier node
    enter: function (node, parent) {
      // If the node is an identifier (i.e. any variable reference)
      if (node.type === 'Identifier') {
        // Walk up the scope chain until we find our containing scope
        var scope = node._nearestScope;
        var info = {
          declared: SCOPE_INFO_DECLARED.NO,
          insideWith: SCOPE_INFO_INSIDE_WITH.NO,
          topLevel: SCOPE_INFO_TOP_LEVEL.NO,
          type: SCOPE_INFO_TYPES.UNDECLARED
        };
        var identifier;
        while (scope) {
          // If we are passing through a `with`, save the info
          if (scope.type === SCOPE_TYPES.WITH) {
            info.insideWith = SCOPE_INFO_INSIDE_WITH.YES;
          }

          // If it contains our variable, stop looping
          identifier = scope.identifiers[node.name];
          if (identifier !== undefined) {
            break;
          }

          // Otherwise, move to the parent scope
          scope = scope.parent;
        }

        // If we didn't find a scope or we are at the top level, mark info as top level
        if (scope === undefined || scope.node.type === 'Program') {
          info.topLevel = SCOPE_INFO_TOP_LEVEL.YES;
        }

        // If we hit an identifier, save the type
        if (identifier) {
          info.type = identifier._scopeType;
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
          info.declared = SCOPE_INFO_DECLARED.UNKNOWN;
        // Otherwise, if we didn't find a scope, marked it as undeclared
        } else if (info.type === SCOPE_INFO_TYPES.UNDECLARED) {
          info.declared = SCOPE_INFO_DECLARED.NO;
        // Otherwise, mark this identifier as declared
        } else {
          info.declared = SCOPE_INFO_DECLARED.YES;
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

// Save constants to our export
ecmaVariableScope.SCOPE_INFO_DECLARED = SCOPE_INFO_DECLARED;
ecmaVariableScope.SCOPE_INFO_INSIDE_WITH = SCOPE_INFO_INSIDE_WITH;
ecmaVariableScope.SCOPE_INFO_TOP_LEVEL = SCOPE_INFO_TOP_LEVEL;
ecmaVariableScope.SCOPE_INFO_TYPES = SCOPE_INFO_TYPES;
ecmaVariableScope.SCOPE_TYPES = SCOPE_TYPES;


// Export our funtion
module.exports = ecmaVariableScope;
