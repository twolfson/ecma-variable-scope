// Load in dependencies
var esprima = require('esprima-fb');
var fnToString = require('function-to-string');
var ecmaVariableScope = require('../../');

// Define test utilities
exports.interpretFnAst = function (fn) {
  before(function loadScriptFn () {
    // Load the file, parse its AST, and run `ecmaVariableScope` through it
    var script = fnToString(fn).body;
    this.ast = esprima.parse(script);
    ecmaVariableScope(this.ast);
  });
  after(function cleanup () {
    delete this.ast;
  });
};
