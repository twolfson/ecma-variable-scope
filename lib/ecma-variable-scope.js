// Define a helper to calculate node info
function calculateScopeInfo(deductions) {
  // TODO: Extend with defaults of all false
  return {
    'var': deductions['var']
  };
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
    return {
      'var': true
    };
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