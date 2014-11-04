// Load in dependencies
var extend = require('obj-extend');

// Define a set of constants
exports.DECLARED_YES = true;
exports.DECLARED_UNKNOWN = 'unknown';
exports.DECLARED_NO = false;

// Define a set of defaults
var defaults = {
  // Summary
  declared: expors.DECLARED_NO, // false

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
  return collectGenericInfo(declarator, {
    'var': declarator.kind === 'var',
    'let': declarator.kind === 'let',
    'const': declarator.kind === 'const'
  });
}

// Define a helper to calculate node info
function collectGenericInfo(node, deductions) {
  // TODO: Extend with defaults of all false
  return extend({}, defaults, deductions);
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