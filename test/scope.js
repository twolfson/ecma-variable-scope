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
        function world() {
          var hai = true;
        }
      }
    });
    before(function grabScope () {
      // {Program} (ast) -> {function} (body[0]) -> {var} (body.body[0])
      //  -> hai (declarations[0].id)
      this.fn1 = this.ast.body[0];
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
      expect(this.scope).to.have.property('scope');
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
