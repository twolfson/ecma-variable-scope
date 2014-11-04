// Load in dependencies
var fs = require('fs');
var esprima = require('esprima');
var expect = require('chai').expect;
var pathval = require('pathval');
var ecmaVariableScope = require('../');

// Define test utilities
var testUtils = {
  collectInfo: function (filepath, nodePath) {
    before(function collectScopeFn () {
      // Load in the file and parse its AST
      var content = fs.readFileSync(filepath, 'utf8');
      var ast = esprima.parse(content);

      // Find the node, collect its info, and save
      // TODO: Use chai property resolver
      var node = pathval.get(ast, nodePath);
      console.log(node.prev);
      this.info = ecmaVariableScope(node);
    });
    after(function cleanup () {
      // Clean up the info
      delete this.info;
    });
  }
};

// Start with our properties tests
describe('ecma-variable-scope', function () {
  describe('gathering info on a top-level variable', function () {
    testUtils.collectInfo(__dirname + '/test-files/props-top-level.js',
      'body[0].declarations[0].id');

    it.skip('tells us the variable is top-level and nothing else', function () {

    });
  });
});

// TODO: Verify that we cover all cases with `common` set
