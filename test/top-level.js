// Load in dependencies
var fs = require('fs');
var esprima = require('esprima-fb');
var ecmaVariableScope = require('../');

// Define test utilities
var testUtils = {
  loadScript: function (filepath) {
    before(function loadScriptFn () {
      // Load the file, parse its AST, and run `ecmaVariableScope` through it
      var script = fs.readFileSync(filepath);
      this.ast = esprima.parse(script);
      ecmaVariableScope(this.ast);
    });
    after(function cleanup () {
      delete this.ast;
    });
  }
};

// Run our tests
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a top level var', function () {
    // TODO: Consider putting source inside of test to make testing easier
    it('marks the initialization as top level', function () {

    });

    it('marks the lexically scoped reference as top level', function () {

    });
  });
});
