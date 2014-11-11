// Load in dependencies
var expect = require('chai').expect;
var scriptUtils = require('./utils/script');

// Run our tests
// Identifier edge cases
// Anything with the `Identifier` that isn't a variable referenc
// https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
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
      var identifier = this.ast.body[1].expression.callee.property;
      console.log(this.ast.body[2]);
      expect(identifier).to.not.have.property('scopeInfo');
    });
  });

  // Double check all of these
  // label
  // break
  // continue
  // property
  // member expression
  // objectpattern key
});
