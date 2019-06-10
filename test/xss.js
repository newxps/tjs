var assert = require('assert');
var tjs = require('..');

describe('XSS', function() {
  it('"<", ">" 应该被转为 "&lt;", "&gt;"', function() {
    var render = tjs('<%-a%><%=b%>');
    var str = render({
        a: '<div>test a</div>',
        b: '<div>test b</div>'
    });

    assert.equal(str, '<div>test a</div>&lt;div&gt;test b&lt;/div&gt;');
  });
});