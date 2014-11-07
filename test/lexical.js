/* jshint -W104 */
// DEV: The JSHint directive above ignores `const` usage
// Load in dependencies
var expect = require('chai').expect;
var scriptUtils = require('./utils/script');

// Run our tests
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a top level `var`', function () {
    scriptUtils.interpretFnAst(function () {
      var hello = 'world';
    });

    it('is considered `lexical`', function () {
      // {Program} (body) -> {var} ([0]) -> hello (declarations[0].id)
      var identifier = this.ast.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'lexical');
    });
  });

  describe('marking up an AST with a top level `const`', function () {
    scriptUtils.interpretFnAst(function () {
      const hello = 'world';
    });

    it('is considered `lexical`', function () {
      // {Program} (body) -> {var} ([0]) -> hello (declarations[0].id)
      var identifier = this.ast.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'lexical');
    });
  });
});
