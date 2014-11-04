// TODO: Parser API docs say that we can have "unnested `let` declarations"
// https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
switch ('apple') {
  let hello = 'world';

  case 'banana':
    break;
}
