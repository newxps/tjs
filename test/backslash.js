var assert = require('assert');
var tjs = require('..');

describe('backslash', function() {
  it('反斜杠', function() {
  	var tpl = `<%
    var str = '今天是\个\好日子'
    var name = 'Tom'
%>
1.\<%-str%>
2.\\A pain\ter hangs <%-name%>'s work o\n a wall`


    var render = tjs(tpl);
    var str = render();

    assert.equal(str, `
1.\今天是个好日子
2.\\A pain\ter hangs Tom's work o\n a wall`);
  });
});