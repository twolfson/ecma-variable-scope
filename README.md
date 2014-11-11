# ecma-variable-scope [![Build status](https://travis-ci.org/twolfson/ecma-variable-scope.png?branch=master)](https://travis-ci.org/twolfson/ecma-variable-scope)

AST utility to collect scope info for variables

// TODO: When done, update name in `ecma-scopes' README`

// TODO: Strongly consider using a code coverage lib
  // Especially a critical one like steamshovel

Scope detection is hard, especially when `with` exists. This utility extracts all relevant info for making decisions. This project was built as part of [`esformatter-phonetic`][], a [`esformatter`][] plugin that makes obfuscated variable names more comprehensible.

[`esformatter-phonetic`]: https://github.com/twolfson/esformatter-phonetic
[`esformatter`]: https://github.com/millermedeiros/esformatter

**Features:**

- Detect `with` usage
- Does not mark `labels`
- Support for `let` and `const`
- Support for destructured variables (e.g. `var {hello, world} = obj;`)
- Support for arrow expressions (e.g. `(hello) => hello.world`)

## Getting Started
Install the module with: `npm install ecma-variable-scope`

```js
// Gather an AST to analyze
var esprima = require('esprima');
var ecmaVariableScope = require('ecma-variable-scope');
var ast = esprima.parse([
  'function logger(str) {',
    'console.log(str);',
  '}'
].join('\n'));

// Determine the scope of a variable
ecmaVariableScope(ast);
ast.body[0].id;
/*
// `logger` variable
  scopeInfo:
   { declared: true,
     topLevel: true,
     insideWith: false,
     type: 'lexical' },
  scope:
   { type: 'lexical',
     node: Program,
     parent: undefined,
     identifiers: { logger: [Circular] },
     children: [ [Object] ] } }
*/

ast.body[0].body.body[0].expression.callee.object;
/*
// `console` variable
  scopeInfo:
   { declared: false,
     topLevel: true,
     insideWith: false,
     type: 'undeclared' },
  scope: undefined
*/
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## Donating
Support this project and [others by twolfson][gratipay] via [gratipay][].

[![Support via Gratipay][gratipay-badge]][gratipay]

[gratipay-badge]: https://cdn.rawgit.com/gratipay/gratipay-badge/2.x.x/dist/gratipay.png
[gratipay]: https://www.gratipay.com/twolfson/

## Unlicense
As of Nov 04 2014, Todd Wolfson has released this repository and its contents to the public domain.

It has been released under the [UNLICENSE][].

[UNLICENSE]: UNLICENSE
