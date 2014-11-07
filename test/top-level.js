// Load in dependencies
var esprima = require('esprima-fb');
var fnToString = require('function-to-string');
var ecmaVariableScope = require('../');

// Define test utilities
var testUtils = {
  interpretAst: function (fn) {
    before(function loadScriptFn () {
      // Load the file, parse its AST, and run `ecmaVariableScope` through it
      var script = fnToString.body;
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
    testUtils.interpretAst(function topLevelFn () {
      // Define variable at top level
      var hello;
      function hai() {
        // Reference again out of top level context
        hello = true;
      }
    });

    // TODO: Consider putting source inside of test to make testing easier
    it('marks the initialization as top level', function () {

    });

    it('marks the lexically scoped reference as top level', function () {

    });
  });

  // describe('mark
});
