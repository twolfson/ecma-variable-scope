/* jshint -W085 */
// DEV: The above directive ignores `with` errors
// Load in dependencies
var expect = require('chai').expect;
var scriptUtils = require('./utils/script');

// Run our tests
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a declared variable', function () {
    scriptUtils.interpretFnAst(function () {
      var hello = 'world';
    });

    it('marks the variable as `declared`', function () {
      // {Program} (ast) -> {var} (body[0]) -> hello (declarations[0].id)
      var identifier = this.ast.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('declared', true);
    });
  });

  describe('marking up an AST with an undeclared variable', function () {
    scriptUtils.interpretFnAst(function () {
      console.log('hello');
    });

    it('marks the variable as `undeclared`', function () {
      // {Program} (ast) -> {console.log} (body[0]) -> console {expression.callee.object}
      var identifier = this.ast.body[0].expression.callee.object;
      expect(identifier.scopeInfo).to.have.property('declared', false);
    });
  });

  describe('marking up an AST with an undeclared variable inside of a `with`', function () {
    scriptUtils.interpretFnAst(function () {
      var obj = {};
      with (obj) {
        console.log('hello');
      }
    });

    it('marks the variable as `unknown`', function () {
      // {Program} (ast) -> {console.log} (body[0]) -> console {expression.callee.object}
      var identifier = this.ast.body[0].expression.callee.object;
      expect(identifier.scopeInfo).to.have.property('declared', 'unknown');
    });
  });
});
