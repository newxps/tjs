/**
* created by flf
*/


;(function (factory) {
  if(typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    window.tpl = factory();
  }
})(function () {
  function _rmJsComment(str) {
    return String(str).replace(/\/\/.*?\n/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  }

  function _encodeHTML (html) {
    return String(html)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/`/g, '&#96;')
      .replace(/'/g, '&#39;')
      .replace(/"/g, '&quot;')
  }

  // 对 ", \n, \t 转义
  function _es (str) {
    return String(str).replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t')
  }

  return function transform (str, opt) {
    str = str || '';
    opt = opt || {};

    var open = opt.open || '<%'
      , close = opt.close || '%>'
      , openCh = open.charAt(0)
      , closeCh = close.charAt(0)
      , openLen = open.length
      , closeLen = close.length

    var isJs = false
      , isSingleQuote = false
      , isDoubleQuote = false
      , isRowCommet = false
      , isBlockCommet = false

    var tokens = ['{', '[', '(', ':', ';'];

    var line;
    
    var i = 0, j = 0, res = '', frag = '';

    // 逐字遍历, 防止引号中包含定界符或引号 导致的bug
    while (j < str.length) {
      if (!isJs) {
        // html
        if (str.indexOf(open) === j) {
          isJs = true;
          frag = _es(str.substring(i, j));
          if (frag) {
            res += '\n_res += "' + frag + '";';
          }
          i = j = j + open.length;
          continue;
        }
      } else {
        // js内部

        // 如果是 // 注释
        if (str.indexOf('\/\/') === j
          && !isSingleQuote
          && !isDoubleQuote
        ) {
          isRowCommet = true;
          i = j;
          j = str.indexOf('\n', j + 2);
          if (~j) {
            res += str.substring(i, j + 1);
            i = j = j + 1;
          } else {
            res += str.substring(i);
            i = j = str.length;
          }
        }

        // 如果是 /**/ 注释
        if (str.indexOf('/*') === j
          && !isSingleQuote
          && !isDoubleQuote
        ) {
          isBlockCommet = true;
          i = j;
          j = str.indexOf('*/', j + 2);
          if (~j) {
            res += str.substring(i, j + 2);
            i = j = j + 2;
          } else {
            res += str.substring(i);
          }
        }

        // 如果是 单引号
        if (str.charAt(j) === "'"
          && str.charAt(j - 1) !== '\\'
          && !isDoubleQuote
        ) {
          isSingleQuote = true;
        }

        // 如果是 双引号
        if (str.charAt(j) === '"'
          && str.charAt(j - 1) !== '\\'
          && !isSingleQuote
        ) {
          isDoubleQuote = true;
        }

        // 如果是 闭合分隔符        
        if (str.charAt(j) === closeCh
          && str.substring(j, j + closeLen) === close
          && !is_single_quote
          && !isDoubleQuote
        ) { 
          isJs = false;
          frag = str.substring(i, j);
          switch (frag.charAt(0)) {
            case '=':
              res += '\n_res += _encodeHTML('+ frag.substring(1).trim() +');';
              break;
            case '-':
              res += '\n_res += ' + frag.substring(1).trim() + ';';
              break;
            default:
              // js语句
              frag = _rmJsComment(frag).trim();
              if (tokens.indexOf(frag.substr(-1)) > -1) {
                res += frag;
              } else {
                res += frag + ';';
              }
          }
          
          i = j = j + closeLen;
          continue;
        }

      }

      j++;
    }

    frag = _es(str.substring(i, j));
    if (frag) {
      res += '_res += "' + frag + '";';
    }

    res = 'var _res = "";\nwith(data || {}) {\n' + res + '\n}\nreturn _res;' 

    var body = new Function('data', '_encodeHTML', res);

    var fn = function (data) {
      return body(data, _encodeHTML);
    }

    return fn.body = body, fn;
  }

});
















