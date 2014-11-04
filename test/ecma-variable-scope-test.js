// Load in dependencies
var fs = require('fs');
var expect = require('chai').expect;
var pathval = require('pathval');
var rocambole = require('rocambole');
var ecmaVariableScope = require('../');

// Define test utilities
var testUtils = {
  collectInfo: function (filepath, nodePath) {
    before(function collectScopeFn () {
      // Load in the file and parse its AST
      var content = fs.readFileSync(filepath, 'utf8');
      var ast = rocambole.parse(content);

      // Find the node, collect its info, and save
      var node = pathval.get(ast, nodePath);
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

    it('tells us the variable is top-level', function () {
      expect(this.info).to.have.property('var', true);
    });

    it('is declared', function () {
      expect(this.info).to.have.property('declared', true);
    });

    it('does not provide any more misinformation', function () {
      ['arguments', 'catch', 'const', 'let', /*'topLevel', */'with'].forEach(function assertFalse (key) {
        expect(this.info).to.have.property(key, false);
      }, this);
    });
  });
});

// TODO: Verify that we cover all cases with `common` set
