;(function(factory) {
	if(typeof module === 'object' && module.exports) {
		module.exports = factory();
	} else {
		window.tpl = factory();
	}
})(function() {
	// function doUglify(str) {
	// 	return str.replace(/([\s\S]+?);*\n+/g, '$1;\n')				// 在所有换行地方替换为;
	// 				.replace(/([\s\S]+?\))[\s;]*(?=\{)/g, '$1')		// 去掉所有)和{之间的;
	// 				.replace(/([\s\S]+?\{)([\s;]*)(?=[^;])/g, '$1 ')
	// 				.replace(/[\s;]*\n+\s*/g, ';');
	// }


	// 待完善
	// function pretty(str) {
	// 	var tab = '\t';
	// 	return str.replace(/([\s\S]+?);/g, '$1;\n')					// 替换 ; 为 ;\n
	// 				.replace(/([\s\S]+?[\{\}])(\s*);?/g, '$1\n') 	// 在 { 和 } 后追加 \n
	// 				.replace(/([\s\S]+?)(for\s*\([\s\S]+?\))/g, function($0, $1, $2) {
	// 					return $1 + $2.replace(/\n+/g, '')			// 删除 for 循环中的 \n
	// 				})
	// 				.replace(/.+;?\n/gm, function($0) {				// 缩进
	// 					if( /^\s*\}/.test($0) ) tab = tab.replace(/\t/, '');
	// 					$0 = tab + $0.replace(/^\s+/, '');
	// 					if( /^\s+break;\s+$/.test($0) ) tab = tab.replace(/\t/, '');
	// 					if( /\{\s*$/.test($0) ) tab += '\t';
	// 					if( /^\s+$/g.test($0) ) $0 = '';
	// 					$0 = $0.replace(/(^\s+case[^\n]+?:)/, function($0, $1) {
	// 						tab += '\t';
	// 						return $1 + '\n' + tab;
	// 					});
	// 					$0 = $0.replace(/(^\s+default\s*?:)/, function($0, $1) {
	// 						tab += '\t';
	// 						return $1 + '\n' + tab;
	// 					})
	// 					// console.log(`|${$0}|`)
	// 					return $0;
	// 				})
	// }

	function rmJsComment(str) {
		return String(str).replace(/\/\/.*?\n/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
	}

	function encodeHTML(html) {
		return String(html).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/`/g, '&#96;').replace(/'/g, '&#39;').replace(/"/g, '&quot;')
	}

	// 对双引号和\n转义
	function escape(str) {
		return String(str).replace(/"/g, '\\"').replace(/\n/g, '\\n');
	}

	return function transform(str, opt) {
		opt = opt || {};
		opt.ld = opt.ld || '<%';
		opt.rd = opt.rd || '%>';
		opt.minify = opt.minify || true;
		opt.uglify = opt.uglify || false;

		var ld = opt.ld, rd = opt.rd;
		var ldc = ld.charAt(0), rdc = rd.charAt(0);

		var i = 0, j = 0, res = '', frag = '';

		var isJs = false, isSq = false, isDq = false

		// 一个一个字符遍历, 防止引号中包含定界符或引号 导致的bug
		while(j < str.length) {
			if(!isJs) {
				// html
				if(str.charAt(j) === ldc && str.substring(j, j + ld.length) === ld) {
					isJs = true;
					frag = escape(str.substring(i, j));
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
							res += '_res += encodeHTML('+ frag.substring(1).trim() +');';
							break;
						case '-':
							res += '_res += ' + frag.substring(1).trim() + ';';
							break;
						default:
							// js语句,  待大量测试
							frag = rmJsComment(frag).trim();
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

		frag = escape(str.substring(i, j));
		if(frag) {
			res += '_res += "' + frag + '";';
		}

		res = 'var _res = "";with(data || {}) {' + res + '}\nreturn _res;' 

		return new Function('data', opt.uglify ? uglify(res) : (res) );
	}

});