

# tjs

模板引擎


[demo](https://demo.fanlinfeng.com/tpl---html%E6%A8%A1%E6%9D%BF%E5%BC%95%E6%93%8E/)


<p align="center">
  <img src="test/asset/tjs.gif" alt="flow" width="600"/>
</p>

### 特性
* 根据 **js** 视图逻辑生成html
* 支持自定义分隔符, 默认 `<%%>`
* 单引号/双引号/反引号/正则表达式中包含分隔符会自动识别并忽略, 例如`<%var str = 'this is a <%test%>'%>` 😄

### 安装
``` bash
$ npm i tjs
```
或者直接引入
``` html
<script src="tjs.min.js"></script>
```

### 例子

模板 tpl
``` html
<%list.forEach(function (item, i) {%>
  <div><%=item%></div>
<%})%>
```

使用
``` javascript
var render = tjs(tpl);

render({
  list: ['Tom', 'Lucy', 'Jack']
})
```

输出
``` html
  <div>Tom</div>

  <div>Lucy</div>

  <div>Jack</div>
```

[更多例子](flfwzgl.github.io/tjs/test)

### 许可
MIT