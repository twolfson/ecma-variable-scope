// Load in dependencies
var expect = require('chai').expect;
var scriptUtils = require('./utils/script');

// Run our tests
// Basic tests
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a `let`', function () {
    scriptUtils.interpretFnAst(function () {
      'use strict';
      let hello = 'world';
    });

    it('is considered `block`', function () {
      // {Program} (ast) -> {let} (body[0]) -> hello (declarations[0].id)
      var identifier = this.ast.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'block');
    });

    it('scopes the variable to the top level', function () {
      var identifier = this.ast.body[0].declarations[0].id;
      expect(identifier.scope.node).to.equal(this.ast);
    });
  });
});
