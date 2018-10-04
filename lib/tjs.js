/**
* created by fanlinfeng
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
    
    var i = 0, j = 0, res = '', isJs = false, ch, tmp;

    while (j <= len) {
      if (!isJs) {
        // html
        if (str.indexOf(open, j) === j || j === len) {
          if (i < j) res += '_res.push("' + _escape(str.substring(i, j)) + '");\n';
          i = j += openLen;
          isJs = true;
          continue;
        }
      } else {
        // js
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

        if (str.charAt(j) === '/') {
          while (~(j = str.indexOf('/', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          j = ~j ? j + 1 : len;
          continue;
        }

        if (str.charAt(j) === '\'') {
          while (~(j = str.indexOf('\'', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          j = ~j ? j + 1 : len;
          continue;
        }

        if (str.charAt(j) === '"') {
          while (~(j = str.indexOf('"', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          j = ~j ? j + 1 : len;
          continue;
        }

        if (str.charAt(j) === '`') {
          while (~(j = str.indexOf('`', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          j = ~j ? j + 1 : len;
          continue;
        }

        if (str.indexOf(close, j) === j || j === len) {
          ch = str.charAt(i);
          if (ch === '=' || ch === '-') {
            if (tmp = str.substring(i + 1, j).trim()) {
              res += ch === '='
                ? '_res.push(_encodeHTML(' + tmp + '));\n'
                : '_res.push(' + tmp + ');\n';
            }
          } else {
            res += str.substring(i, j) + '\n';
          }
          i = j += closeLen;
          isJs = false;
          continue;
        }
      }
      j++;
    }

    res = res
      ? 'var _res = [];\n' +
        'with (data || {}) {\n' + res + '}\n' +
        'return _res.join("");'
      : 'return "";'

    var body = new Function('data', '_encodeHTML', res);
    var fn = function (data) {
      return body(data, _encodeHTML);
    }

    return fn.body = body, fn;
  }

});
