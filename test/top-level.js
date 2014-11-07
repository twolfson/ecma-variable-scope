// Load in dependencies
var esprima = require('esprima-fb');
var expect = require('chai').expect;
var fnToString = require('function-to-string');
var ecmaVariableScope = require('../');

// TODO: Test declared/undeclared
// TODO: Test with/without
// TODO: Test each of the covered cases in `lib/`
// TODO: Strongly consider using a code coverage lib
  // Especially a critical one like steamshovel

// Define test utilities
var testUtils = {
  interpretAst: function (fn) {
    before(function loadScriptFn () {
      // Load the file, parse its AST, and run `ecmaVariableScope` through it
      var script = fnToString(fn).body;
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

    it('marks the initialization as top level', function () {
      // {Program} (body) -> {var} ([0]) -> hello (declarations[0].id)
      var identifier = this.ast.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('topLevel', true);
    });

    it('marks the top level variable within a funtion as top level', function () {
      // {Program} (body) -> {fn body} ([1].body.body) -> hello ([0].expression.left)
      var identifier = this.ast.body[1].body.body[0].expression.left;
      expect(identifier.scopeInfo).to.have.property('topLevel', true);
    });
  });

  describe('marking up an AST without a top level var', function () {
    testUtils.interpretAst(function nonTopLevelFn () {
      function hai() {
        var hello = true;
      }
    });

    it('marks the lexically scoped variable as not top level', function () {
      // {Program} (body) -> {fn body} ([0].body.body) -> {var} [0] -> hello (declarations[0].id)
      var identifier = this.ast.body[0].body.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('topLevel', false);
    });
  });
});
