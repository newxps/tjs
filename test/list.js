var assert = require('assert');
var tjs = require('..');

describe('list render', function() {
  it('', function() {
    var tpl = `<%if (list && list.length) {%>
  <ul>
    <%list.forEach(function (item, i) {%>
    <li class="item <%=i % 2 === 0 ? 'grey' : ''%>"><%=item.id%>. <%=item.name%></li>
    <%})%>
  </ul>
<%} else {%>
  <div>无数据</div>
<%}%>`

    var render = tjs(tpl);
    var str = render({
      list: [{
        id: 3, name: 'Tom'
      }, {
        id: 5, name: 'Jack'
      }, {
        id: 9, name: 'Lily'
      }]
    });

    assert.equal(str, `
  <ul>
    
    <li class="item grey">3. Tom</li>
    
    <li class="item ">5. Jack</li>
    
    <li class="item grey">9. Lily</li>
    
  </ul>
`);
  });
});