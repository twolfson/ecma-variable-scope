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
      // {Program} (ast) -> {let} (body[1]) -> hello (declarations[0].id)
      var identifier = this.ast.body[1].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'block');
    });

    it('scopes the variable to the top level', function () {
      var identifier = this.ast.body[1].declarations[0].id;
      expect(identifier.scope.node).to.equal(this.ast);
    });
  });
});

// Intermediate tests
describe('ecma-variable-scope', function () {
  describe.only('marking up an AST with a block statement', function () {
    scriptUtils.interpretFnAst(function () {
      'use strict';
      if (true) {
        let hello = 'world';
      }
    });

    it('is considered `block`', function () {
      // {Program} (ast) -> {if} (body[1]) -> {block} (consequent) -> {let} (body[0])
      //   -> hello (declarations[0].id)
      var identifier = this.ast.body[1].consequent.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'block');
    });

    it('scopes the variable to the block statement', function () {
      var block = this.ast.body[1].consequent;
      var identifier = block.body[0].declarations[0].id;
      expect(identifier.scope.node).to.equal(block);
    });
  });
});

// Edge cases
describe('ecma-variable-scope', function () {
  // TODO: Test me
  describe.skip('marking up an AST with a `let` inside a `function`', function () {
    scriptUtils.interpretFnAst(function () {
      (function myFn () {
        'use strict';
        let hello = 'world';
      }());
    });

    it('is considered `block`', function () {
      // {Program} (ast) -> {let} (body[1]) -> hello (declarations[0].id)
      var identifier = this.ast.body[1].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'block');
    });

    it('scopes the variable to the block statement', function () {
      var identifier = this.ast.body[1].declarations[0].id;
      expect(identifier.scope.node).to.equal(this.ast);
    });
  });
});
