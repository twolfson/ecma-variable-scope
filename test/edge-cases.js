// Load in dependencies
var expect = require('chai').expect;
var scriptUtils = require('./utils/script');

// Run our tests
// Identifier edge cases
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a call expression', function () {
    scriptUtils.interpretFnAst(function () {
      var logger = {
        info: function () {}
      };
      logger.info('hello');
    });

    it.only('does not mark the `info` property with a `scope`', function () {
      // {Program} (ast) -> {logger.info} (body[1]) -> info (expression.callee.property)
      console.log(this.ast.body[1].expression);
      var identifier = this.ast.body[1].expression.callee.property;
      expect(identifier).to.not.have.property('scopeInfo');
    });
  });
});
