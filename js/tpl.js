;(function(factory) {
	if(typeof module === 'object' && module.exports) {
		module.exports = factory();
	} else {
		window.tpl = factory();
	}
})(function() {
	function _rmJsComment(str) {
		return String(str).replace(/\/\/.*?\n/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
	}

	function _encodeHTML(html) {
		return String(html).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/`/g, '&#96;').replace(/'/g, '&#39;').replace(/"/g, '&quot;')
	}

	// 对双引号和\n转义
	function _es(str) {
		return String(str).replace(/"/g, '\\"').replace(/\n/g, '\\n');
	}

	return function transform(str, opt) {
		opt = opt || {};
		opt.ld = opt.ld || '<%';
		opt.rd = opt.rd || '%>';
		opt.minify = opt.minify || true;
		opt.uglify = opt.uglify || false;

		// ld -> left delimiter,  rd -> right delimiter,  ldc -> left delimiter char
		var ld = opt.ld, rd = opt.rd;
		var ldc = ld.charAt(0), rdc = rd.charAt(0);

		var i = 0, j = 0, res = '', frag = '';

		// isSq -> is single quote,  isDq -> is double quote
		var isJs = false, isSq = false, isDq = false

		// 一个一个字符遍历, 防止引号中包含定界符或引号 导致的bug
		while(j < str.length) {
			if(!isJs) {
				// html
				if(str.charAt(j) === ldc && str.substring(j, j + ld.length) === ld) {
					isJs = true;
					frag = _es(str.substring(i, j));
					if(frag) {
						res += '_res += "' + frag + '";';
					}
					i = j = j + ld.length;
					continue;
				}
			} else {
				// js内部
				if(str.charAt(j) === "'" && str.charAt(j - 1) !== '\\' && !isDq) {
					isSq = !isSq;
				}

				if(str.charAt(j) === '"' && str.charAt(j - 1) !== '\\' && !isSq) {
					isDq = !isDq;
				}

				if(str.charAt(j) === rdc && str.substring(j, j + rd.length) === rd && !isSq && !isDq) {
					isJs = false;
					frag = str.substring(i, j);
					switch( frag.charAt(0) ) {
						case '=':
							res += '_res += _encodeHTML('+ frag.substring(1).trim() +');';
							break;
						case '-':
							res += '_res += ' + frag.substring(1).trim() + ';';
							break;
						default:
							// js语句,  待大量测试
							frag = _rmJsComment(frag).trim();
							if(['{', '[', '(', ':', ';'].indexOf(frag.substr(-1)) > -1) {
								res += frag;
							} else {
								res += frag + ';';
							}
					}
					
					i = j = j + rd.length;
					continue;
				}

			}

			j++;
		}

		frag = _es(str.substring(i, j));
		if(frag) {
			res += '_res += "' + frag + '";';
		}

		res = 'var _res = "";with(data || {}) {' + res + '}\nreturn _res;' 

		return new Function('data', opt.uglify ? uglify(res) : (res) );
	}

});