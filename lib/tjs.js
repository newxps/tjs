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
      , bi = 0  // lastBreakIndex

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
    var operator = '[+\\-*%^~!?&|:[=(;\\n,<>]';

    // 对 / 左边判断当前是否处于正则
    var identifer = '(^|' + operator
      + '|' + operator + ws + '*typeof' + ws
      + '|' + ws + 'in' + ws
      + '|' + ws + 'of' + ws
      + '|' + ws + 'instanceof' + ws
      + '|' + operator + ws + '*void' + ws
      + ')' + ws + '*$'

    var reg = new RegExp(identifer);

    var i = 0, j = 0, body = '', isJs = false, ch, tmp;

    while (j <= len) {
      if (!isJs) {
        // html
        if (str.indexOf(open, j) === j || j === len) {
          if (i < j) body += '_res.push("' + _escape(str.substring(i, j)) + '");\n';
          bi = i = j += openLen;
          isJs = true;
          continue;
        }
      } else {
        // js
        ch = str.charAt(j);

        if (ch === '\n') bi = j;

        if (str.substring(j, j + 2) === '//') {
          j = str.indexOf('\n', j);
          j = ~j ? j + 1 : len;
          continue;
        }

        if (str.substring(j, j + 2) === '/*') {
          j = str.indexOf('*/', j + 2);
          j = ~j ? j + 2 : len;
          continue;
        }

        // 到底是正则表达式如 /2+3/ , 还是 1/2+3/4 类型算术表达式?
        if (ch === '/' && reg.test(str.substring(bi, j))) {
          while (~(j = str.indexOf('/', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          j = ~j ? j + 1 : len;
          continue;
        }

        if (ch === '\'') {
          while (~(j = str.indexOf('\'', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          j = ~j ? j + 1 : len;
          continue;
        }

        if (ch === '"') {
          while (~(j = str.indexOf('"', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          j = ~j ? j + 1 : len;
          continue;
        }

        if (ch === '`') {
          while (~(j = str.indexOf('`', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          j = ~j ? j + 1 : len;
          continue;
        }

        if (str.indexOf(close, j) === j || j === len) {
          ch = str.charAt(i);
          if (ch === '=' || ch === '-') {
            if (tmp = str.substring(i + 1, j).trim()) {
              body += ch === '='
                ? '_res.push(_encodeHTML(' + tmp + '));\n'
                : '_res.push(' + tmp + ');\n';
            }
          } else {
            body += str.substring(i, j) + '\n';
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
        'with (data || {}) {\n' + body + '}\n' +
        'return _res.join("");'
      : 'return "";'

    var _render = new Function('data', '_encodeHTML', body);
    var render = function (data) {
      return _render(data, _encodeHTML);
    }

    return render.body = body, render;
  }

});
