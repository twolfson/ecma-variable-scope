// Load in dependencies
var extend = require('obj-extend');

// Define a set of constants
exports.DECLARED_YES = true;
exports.DECLARED_UNKNOWN = 'unknown';
exports.DECLARED_NO = false;

// Define a set of defaults
var defaults = {
  // Summary
  declared: exports.DECLARED_NO, // false

  // Scope level
  topLevel: false,
  'with': false,

  // VariableDeclaration
  'var': false,
  'let': false,
  'const': false,

  // Function
  'function': false,

  // Try/catch
  'catch': false
};

// Define a helper to collect info from the `VariableDeclarator` node
function collectDeclaratorInfo(declarator) {
  // Find the declaration
  // https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Declarations
  var declaration = declarator.parent;
  return collectGenericInfo(declaration, {
    'var': declarator.kind === 'var',
    // TODO: Properly handle block scoping with `let` for `toplevel`
    'let': declarator.kind === 'let',
    // TODO: Is `const` block or lexical scoping?
    'const': declarator.kind === 'const'
  });
}

// Define a helper to calculate node info
function collectGenericInfo(_node, deductions) {
  // Resolve the scope for our node
  var scope = 'lexical';
  var node = _node;
  if (node.type === 'VariableDeclaration' && node.kind === 'let') {
    scope = 'block';
  }

  // Resolve the scope container
  node = _node;
  var scopeContainer;
  while (node) {
    // If we are at a function or the Program, stop traversing
    // TODO: Verify we handle both flavors of function (declaration and inline)
    if (node.type === 'Program') {
      scopeContainer = node;
      break;
    }

    // If we are checking against `block` scoping
    // TODO: Find a JSON block that matches what we expect
    // TODO: If we cannot find it, make one and publish it
    // TODO: Does this cover it? https://github.com/Constellation/esutils/blob/1.1.4/lib/ast.js#L64-L88
    /*{
      program: 'Program',
      lexical: [
        'FunctionExpression'
      ],
      block: [
        'IfStatement'
      ]
    }*/
    if (scope === 'block') {
      // TODO: Detect block scopes
    }

    // Move to the parent
    node = node.parent;
  }

  // TODO: `with` should be collected in other traversal steps and passed through
  return extend({}, defaults, {
    topLevel: scopeContainer.type === 'Program'
  }, deductions);
}

// Define our scope collector
function ecmaVariableScope(_node) {
  // If the node is not an identifier, complain and leave
  // TODO: Are `labels` considered identifiers?
  var node = _node;
  var retObj = {

  };
  if (node.type !== 'Identifier') {
    throw new Error('`ecmaVariableScope` expected an "Identifier" but received "' + node.type + '"');
  }

  // Gather the name
  var varName = node.name;

  // If the current item is a variable declaration, exit early
  if (node.parent && node.parent.type === 'VariableDeclarator') {
    return collectDeclaratorInfo(node.parent);
  }

  // Traverse this scope to the previous node
  node = _node;
  while (node) {
    // Move to the previous node
    node = node.prev;
  }
  // console.log(require('util').inspect(node, {depth: 1}));

  // Tra

}

// Export our scope collector
module.exports = ecmaVariableScope;
