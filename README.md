
### 简单的JavaScript模板工具

[demo](https://demo.fanlinfeng.com/tpl---html%E6%A8%A1%E6%9D%BF%E5%BC%95%E6%93%8E/)

#### 用法
```javascript
String.prototype.render = function(data){
  return tpl(this)(data);
}


`<%
  // 生成1000以内随机整数
  function getRand() {
    return Math.random()*1000 | 0;
  }
%>

<%if(list.length > 0) {%>
  <ul>
    <%list.forEach(function(e, i) {%>
      <li data-rand="<%=getRand()%>" role="<%=e.isVIP ? 'vip' : ''%>">
        <%=e.id + '.' + e.name%>
        <%-i % 2 === 0 ? '(双数)' : '(单数)'%>
      </li>
    <%})%>
  </ul>
<%} else {%>
  <!-- 当数据为空的时候 -->
  <div class="null">无数据</div>
<%}%>`.render({
  list: [{
    id: 1, name: '周杰伦'
  }, {
    id: 3, name: '陈奕迅'
  }, {
    id: 5, name: '张学友', isVIP: true
  }, {
    id: 8, name: '许巍'
  }]
})
```

生成结果:
```html
<ul>    
  <li data-rand="116" role="">
    1.周杰伦
    (双数)
  </li>
  <li data-rand="390" role="">
    3.陈奕迅
    (单数)
  </li>
  <li data-rand="381" role="vip">
    5.张学友
    (双数)
  </li>
  <li data-rand="456" role="">
    8.许巍
    (单数)
  </li>
</ul>
```

