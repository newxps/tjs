/**
 * created by flfwzgl
 * github.com/flfwzgl/tjs
 */

;(function (factory) {
  if(typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    window.tjs = factory();
  }
})(function () {
  function _encodeHTML (html) {
    return String(html)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/`/g, '&#96;')
      .replace(/'/g, '&#39;')
      .replace(/"/g, '&quot;')
  }
  
  // 对 \ " \n 转义
  function _escape (str) {
    return String(str)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
  }

  return function transform (str, opt) {
    str = str || '';
    opt = opt || {};

    var open = opt.open || '<%'
      , close = opt.close || '%>'
      , openLen = open.length
      , closeLen = close.length
      , len = str.length

    var ws = '[\\x20\\t]';  // whitespace

    // https://www.ecma-international.org/ecma-262/5.1/#sec-11.4
    /**
     * '(':   (/abc/)
     * '[':   [/abc/]
     * ',':   (1,/abc/)
     * '?':   a?/abc/:''
     * ':':   {a:/abc/} or a?'':/abc/
     * ';':   ;/abc/
     * '&':   a&&/abc/
     */
    // 一元运算符, 二元操作符, 以及 (, [, ;
    var operator = '[=:,(+\\-*;!?&|[%<>^~]';

    // 对 / 左边判断当前是否处于正则
    // 使用频率从高到低排列, 以提升正则性能
    var identifer = '(^|' + operator
      + '|' + operator + '?' + ws + '*typeof' + ws
      + '|' + ws + 'in' + ws
      + '|' + ws + 'instanceof' + ws
      + '|' + ws + 'of' + ws
      + '|' + operator + '?' + ws + '*delete' + ws
      + '|' + operator + '?' + ws + '*void' + ws
      + ')' + ws + '*$'

    var reg = new RegExp(identifer);

    var i = 0   // 跟踪<%之后
      , j = 0   // 扫描<%%>内部, 直到%>
      , k = 0   // 跟踪\n之后, '', "", ``, //, /**/之后
      , body = ''
      , isJs = false
      , ch
      , tmp

    while (j <= len) {
      if (!isJs) {
        // html
        if (str.indexOf(open, j) === j || j === len) {
          if (i < j) body += '\n_res.push("' + _escape(str.substring(i, j)) + '")';
          k = i = j += openLen;
          isJs = true;
          continue;
        }
      } else {
        // js
        ch = str.charAt(j);

        if (ch === '\n') {
          k = ++j;
          continue;
        }

        if (str.substring(j, j + 2) === '//') {
          j = str.indexOf('\n', j);
          k = j = ~j ? j + 1 : len;
          continue;
        }

        if (str.substring(j, j + 2) === '/*') {
          j = str.indexOf('*/', j + 2);
          k = j = ~j ? j + 2 : len;
          continue;
        }

        // 到底是正则表达式如 /2+3/ , 还是 1/2+3/4 类型算术表达式?
        if (ch === '/' && reg.test(str.substring(k, j))) {
          /** 
           * var a = 1
           * /abc/
           * error: Uncaught SyntaxError
           */
          body += ';'
          while (~(j = str.indexOf('/', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          j = ~j ? j + 1 : len;
          continue;
        }

        if (ch === '\'') {
          while (~(j = str.indexOf('\'', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          k = j = ~j ? j + 1 : len;
          continue;
        }

        if (ch === '"') {
          while (~(j = str.indexOf('"', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          k = j = ~j ? j + 1 : len;
          continue;
        }

        if (ch === '`') {
          while (~(j = str.indexOf('`', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          k = j = ~j ? j + 1 : len;
          continue;
        }

        if (str.indexOf(close, j) === j || j === len) {
          ch = str.charAt(i);
          if (ch === '=' || ch === '-') {
            if (tmp = str.substring(i + 1, j).trim()) {
              body += ch === '='
                ? '\n_res.push(_encodeHTML(' + tmp + '))'
                : '\n_res.push(' + tmp + ')';
            }
          } else {
            body += '\n' + str.substring(i, j);
          }
          i = j += closeLen;
          isJs = false;
          continue;
        }
      }
      j++;
    }

    body = body
      ? 'var _res = [];\n' +
        'with (data || {}) {' + body + '\n}\n' +
        'return _res.join("");'
      : 'return "";'

    var _render = new Function('data', '_encodeHTML', body);
    var render = function (data) {
      return _render(data, _encodeHTML);
    }

    return render.body = body, render;
  }

});
