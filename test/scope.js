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
      function hello() {
        var world = true;
      }
    });
    before(function grabScope () {
      // {Program} (ast) -> {function} (body[0]) -> {var} (body.body[0])
      //  -> hai (declarations[0].id)
      this.fn = this.ast.body[0];
      this.identifier = this.fn.body.body[0].declarations[0].id;
      this.scope = this.identifier.scope;
    });
    after(function cleanup () {
      delete this.fn;
      delete this.identifier;
      delete this.scope;
    });

    it('gives a `scope` a `type`', function () {
      expect(this.scope).to.have.property('type', 'lexical');
    });

    it('gives a `scope` a `node`', function () {
      expect(this.scope).to.have.property('node', this.fn);
    });

    it('gives a `scope` a `parent`', function () {
      expect(this.scope).to.have.property('parent', this.ast.scope);
    });

    it('saves `identifiers` on a `scope`', function () {
      expect(this.scope).to.have.property('identifiers');
      expect(this.scope.identifiers).to.have.keys(['world']);
      expect(this.scope.identifiers.world).to.equal(this.identifier);
    });

    it.skip('saves child scopes on a `scope`', function () {

    });
  });

  // TODO: Test out `undefined` parent

  // TODO: scopeInfo.type = `undeclared` and `scope` === undefined
});
