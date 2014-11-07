// Load in dependencies
var expect = require('chai').expect;
var scriptUtils = require('./utils/script');

// Run our tests
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a var inside referenced through a `with`', function () {
    scriptUtils.interpretFnAst(function topLevelFn () {
      var hello = 'world';
      var obj = {hello: 'moon'};
    });

    it.skip('marks the initialization without a `with`', function () {
      // {Program} (body) -> {var} ([0]) -> hello (declarations[0].id)
      var identifier = this.ast.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('insideWith', false);
    });
  });
});
