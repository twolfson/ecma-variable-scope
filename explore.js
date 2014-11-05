var rocambole = require('rocambole');
var functionToString = require('function-to-string');

var program = functionToString(function () {
  console.log('sup');
}.toString()).body;

console.log(program);
