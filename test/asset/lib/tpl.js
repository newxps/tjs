/**
 * tjs原始版本, 因为使用正则匹配, 和其他模板引擎一样, 无法对字符串/注释/正则表达式中的分隔符识别
 * 例如: <%var str = 'abc%>def'%>
 */

;(function (factory) {
  if(typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    window.tpl = factory();
  }
})(function () {
  return function transform (str) {
    if (typeof str !== 'string') throw new TypeError('str 必须是 string!');

    var ret = '', list = str.match(/<%[\s\S]+?%>|[\s\S]+?(?=<%)/g);
    if (!list || list.length === 0) return function () { return ''; }
    list.forEach(function (code, i) {
      if (code.indexOf('<%') === 0) {
        code = code.replace(/^<%|%>$/g, '');
        var c = code.charAt(0);
        if (c === '=') {
          ret += 'res.push(encode(' + code.substring(1) + '));\n';
        } else if (c === '-') {
          ret += 'res.push(' + code.substring(1) + ');\n';
        } else {
          ret += code + '\n';
        }
      } else {
        ret += 'res.push("' + _escape(code) + '");\n';
      }
    });
    ret = 'var res = [];\nwith (data || {}) {\n' + ret + '\n}\nreturn res.join("");';
    var fn = new Function('data', 'encode', ret);
    return function (data) {
      return fn(data, encode);
    }

    function encode (html) {
      return String(html).replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/`/g, '&#96;')
        .replace(/'/g, '&#39;')
        .replace(/"/g, '&quot;')
    }

    function _escape (str) {
      return String(str)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
    }
  }
  
})