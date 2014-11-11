// Load in dependencies
var expect = require('chai').expect;
var scriptUtils = require('./utils/script');

// Run our tests
// Anything with the `Identifier` that isn't a variable reference
// https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a MemberExpression', function () {
    scriptUtils.interpretFnAst(function () {
      var logger = {
        info: function () {}
      };
      logger.info('hello');
    });

    it('does not mark the `info` property with a `scope`', function () {
      // {Program} (ast) -> {logger.info} (body[1]) -> info (expression.callee.property)
      var identifier = this.ast.body[1].expression.callee.property;
      expect(identifier).to.not.have.property('scope');
      expect(identifier).to.not.have.property('scopeInfo');
    });
  });

  describe('marking up an AST with an object Property', function () {
    scriptUtils.interpretFnAst(function () {
      var logger = {
        info: function () {}
      };
    });

    it.only('does not mark the `info` property with a `scope`', function () {
      // {Program} (ast) -> {var} (body[0]) -> {logger} (declarations[0].init) -> info (properties[0].key)
      var identifier = this.ast.body[0].declarations[0].init.properties[0].key;
      expect(identifier).to.not.have.property('scope');
      expect(identifier).to.not.have.property('scopeInfo');
    });
  });

  // TODO: Verify again with ES5 `get`/`set

  // Double check all of these
  // label
  // break
  // continue
  // property
  // objectpattern key
});
