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
    var identifer = '(?:'
      + '(?:' + operator + '|^)(?:|' + ws + '*typeof' + ws + '|' + ws + '*delete' + ws + '|' + ws + '*void' + ws + ')'
      + '|'
      + '(?:' + ws + 'in|' + ws + 'instanceof|' + ws + 'of)' + ws
      + ')'
      + ws + '*$'

    var rcheckStartWithReg = new RegExp(identifer);

    var codeMappingList = [];

    var i = 0   // 跟踪<%之后
      , j = 0   // 扫描<%%>内部, 直到%>
      , k = 0   // 跟踪\n之后, '', "", ``, //, /**/之后
      , body = ''
      , start   // dist code start position
      , end       // dist code end position
      , isJs = false
      , ch
      , tmp
      , isBracketOpen = false
      , mustCut = false

    while (j <= len) {
      if (!isJs) {
        // html
        if (str.indexOf(open, j) === j || j === len) {
          if (i < j) {
            start = body.length;
            tmp = _escape(str.substring(i, j));
            if (isBracketOpen) {
              body += ', "' + tmp + '"';
              start += 3, end = body.length - 1;
            } else {
              body += '\n_res.push("' + tmp + '"';
              start += 12, end = body.length - 1;
              isBracketOpen = true;
            }
            codeMappingList.push([i, start], [j, end, body.substring(start, end)]);
          }
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
        if (ch === '/' && rcheckStartWithReg.test(str.substring(k, j))) {
          /** 
           * var a = 1
           * /abc/
           * error: Uncaught SyntaxError
           */
          mustCut = true;
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
          mustCut = true;
          while (~(j = str.indexOf('`', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          k = j = ~j ? j + 1 : len;
          continue;
        }

        if (str.indexOf(close, j) === j || j === len) {
          ch = str.charAt(i);
          if (ch === '=' || ch === '-') {
            if (tmp = str.substring(i + 1, j).trim()) {
              start = body.length;
              if (isBracketOpen) {
                if (ch === '=') {
                  body += ', _encodeHTML(' + tmp + ')';
                  start += 14, end = body.length - 1;
                } else {
                  body += ', ' + tmp
                  start += 2, end = body.length;
                }
              } else {
                if (ch === '=') {
                  body += '\n_res.push(_encodeHTML(' + tmp + ')';
                  start += 23, end = body.length - 1;
                } else {
                  body += '\n_res.push(' + tmp;
                  start += 11, end = body.length;
                }

                isBracketOpen = true;
              }
              codeMappingList.push([i + 1, start], [j, end, body.substring(start, end)]);
            }
          } else {            
            if (isBracketOpen) body += ')';
            if (mustCut) body += ';';

            body += '\n';
            start = body.length;
            body += str.substring(i, j);
            end = body.length;

            codeMappingList.push([i, start], [j, end, body.substring(start, end)]);

            isBracketOpen = false;
          }
          // if (isBracketOpen) body += ')';
          mustCut = false;
          i = j += closeLen;
          isJs = false;
          continue;
        }
      }
      j++;
    }

    if (isBracketOpen) body += ')';

    body = body
      ? 'var _res = [];\n' +
        'with (data || {}) {' + body + '\n}\n' +
        'return _res.join("");'
      : 'return "";'

    // precompile debug
    if (typeof opt.compiled === 'function') {
      opt.compiled('function anonymous () {\n' + body + '\n}', codeMappingList);
    }

    var _render = new Function('data', '_encodeHTML', body);
    var render = function (data) {
      return _render(data, _encodeHTML);
    }

    return render.body = body, render;
  }

});
