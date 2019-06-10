var assert = require('assert');
var tjs = require('..');

describe('comment', function() {
  it('注释中包含 "<%", "%>" 时自动跳过', function() {
  	var tpl = `<!-- html注释 -->
// 你好
<%
    // 这才是注释! <%😇%>

    /**
     * 多行注释 <%😎%>, tjs正常解析, ejs报错
     */
    
    var str = 'abcd';
%>
1.<%//注释3
%>
2.<%/*注释4*/%>
3.<%-str%>`


    var render = tjs(tpl);
    var str = render();

    assert.equal(str, `<!-- html注释 -->
// 你好

1.
2.
3.abcd`);
  });
});