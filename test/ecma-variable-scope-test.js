// Load in dependencies
var fs = require('fs');
var esprima = require('esprima-fb');
var ecmaVariableScope = require('../');

describe('ecma-variable-scope', function () {
  it('dev work...', function () {
    var script = fs.readFileSync(__dirname + '/explore.js');
    var ast = esprima.parse(script);
    ecmaVariableScope(ast);
  });
});
