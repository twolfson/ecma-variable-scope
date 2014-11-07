/* jshint -W104 */
// DEV: The JSHint directive above ignores `const` usage
// Load in dependencies
var expect = require('chai').expect;
var scriptUtils = require('./utils/script');

// Run our tests
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a `var`', function () {
    scriptUtils.interpretFnAst(function () {
      var hello = 'world';
    });

    it('is considered `lexical`', function () {
      // {Program} (body) -> {var} ([0]) -> hello (declarations[0].id)
      var identifier = this.ast.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'lexical');
    });

    it.skip('scopes the variable to the top level', function () {

    });
  });

  describe('marking up an AST with a `const`', function () {
    scriptUtils.interpretFnAst(function () {
      const hello = 'world';
    });

    it('is considered `lexical`', function () {
      // {Program} (body) -> {var} ([0]) -> hello (declarations[0].id)
      var identifier = this.ast.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'lexical');
    });

    it.skip('scopes the variable to the top level', function () {

    });
  });

  describe.only('marking up an AST with a function declaration', function () {
    scriptUtils.interpretFnAst(function () {
      function hello(world) {
        // Code goes here
      }
    });

    it('marks the function name as lexically scoped to the outer scope', function () {
      // {Program} (body) -> {fn} ([0]) -> hello (id)
      var identifier = this.ast.body[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'lexical');
      // TODO: Come back to me
      // expect(identifier.scope.node).to.equal(this.ast.body);
    });

    it('marks the function parameters as lexically scoped to the function', function () {
      // {Program} (body) -> {fn} ([0]) -> world (params[0])
      var identifier = this.ast.body[0].params[0];
      expect(identifier.scopeInfo).to.have.property('type', 'lexical');
      // console.log(identifier.scope.node);
      // expect(identifier.scope.node).to.equal(this.ast.body[0]);
    });
  });

  describe.skip('marking up an AST with an unnamed function expression', function () {
    scriptUtils.interpretFnAst(function () {
      [].map(function (world) {
        // Code goes here
      });
    });

    it('does not cause errors', function () {
      // Errors would throw in `before`
    });
  });
});
