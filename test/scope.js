// Load in dependencies
var expect = require('chai').expect;
var scriptUtils = require('./utils/script');

// Run our tests
// DEV: `scopeInfo` is distributed across `with.js` (`insideWith`),
//   `top-level.js` (`topLevel`), `declared.js` (`declared`),
//   `lexical.js`/`block.js` (`type` except for `undeclared`)
describe('ecma-variable-scope', function () {
  describe.only('marking up an AST for its scopes', function () {
    scriptUtils.interpretFnAst(function () {
      var logger = {
        info: function () {}
      };
      logger.info('hello');
    });

    it('gives a `scope` a `type`', function () {
      // {Program} (ast) -> {logger.info} (body[1]) -> logger (expression.callee.object)
      var identifier = this.ast.body[1].expression.callee.object;
      expect(identifier).to.have.property('scope');
      expect(identifier).to.have.property('scopeInfo');
    });

    it('gives a `scope` a `node`', function () {
      // {Program} (ast) -> {logger.info} (body[1]) -> logger (expression.callee.object)
      var identifier = this.ast.body[1].expression.callee.object;
      expect(identifier).to.have.property('scope');
      expect(identifier).to.have.property('scopeInfo');
    });

    it('gives a `scope` a `parent`', function () {
      // {Program} (ast) -> {logger.info} (body[1]) -> logger (expression.callee.object)
      var identifier = this.ast.body[1].expression.callee.object;
      expect(identifier).to.have.property('scope');
      expect(identifier).to.have.property('scopeInfo');
    });

    it('saves its identifiers', function () {

    });

    it('saves its child scopes', function () {

    });
  });

  // TODO: Test out `undefined` parent

  // TODO: scopeInfo.type = `undeclared` and `scope` === undefined
});
