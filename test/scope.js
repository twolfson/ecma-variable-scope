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
      function hello(world) {
        var hai = true;
      }
    });
    before(function grabScope () {
      // {Program} (ast) -> {function} (body[0]) -> {var} (body.body[0])
      //  -> hai (declarations[0].id)
      this.identifier = this.ast.body[0].body.body[0].declarations[0].id;
      this.scope = this.identifier.scope;
    });
    after(function cleanup () {
      delete this.identifier;
      delete this.scope;
    });

    it('gives a `scope` a `type`', function () {
      expect(this.scope).to.have.property('type', 'lexical');
    });

    it.skip('gives a `scope` a `node`', function () {
      // {Program} (ast) -> {logger.info} (body[1]) -> logger (expression.callee.object)
      var identifier = this.ast.body[1].expression.callee.object;
      expect(identifier).to.have.property('scope');
      expect(identifier).to.have.property('scopeInfo');
    });

    it.skip('gives a `scope` a `parent`', function () {
      // {Program} (ast) -> {logger.info} (body[1]) -> logger (expression.callee.object)
      var identifier = this.ast.body[1].expression.callee.object;
      expect(identifier).to.have.property('scope');
      expect(identifier).to.have.property('scopeInfo');
    });

    it.skip('saves its identifiers', function () {

    });

    it.skip('saves its child scopes', function () {

    });
  });

  // TODO: Test out `undefined` parent

  // TODO: scopeInfo.type = `undeclared` and `scope` === undefined
});
