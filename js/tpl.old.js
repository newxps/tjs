;(function(factory) {
	if(typeof module === 'object' && module.exports) {
		module.exports = factory();
	} else {
		window.tpl = factory();
	}

})(function() {

	function escape(html) {
		return String(html).replace(/&/g, '&amp;')
							.replace(/</g, '&lt;')
							.replace(/>/g, '&gt;')
							.replace(/`/g, '&#96;')
							.replace(/'/g, '&#39;')
							.replace(/"/g, '&quot;')
	}
	function rmJsComment(str) {
		return String(str).replace(/\/\/.*?\n/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
	}

	// 对双引号和\n转义
	function es(str) {
		return String(str).replace(/"/g, '\\"').replace(/\n/g, '\\n');
	}

	function save(str, fn) {
		var p1 = 0, p2 = 0, a, b, c;
		var res = '', tmp = '';
		while(1) {
			a = str.indexOf("'", p1);
			b = str.indexOf('"', p1);

			if(a >= 0 && b >= 0) {
				if(a <= b) {
					p2 = a, c = "'";
				} else {
					p2 = b, c = '"';
				}
			} else {
				if(a === -1 && b >= 0) {
					p2 = b, c = '"';
				} else if(a >= 0 && b === -1) {
					p2 = a, c = "'";
				} else {
					// 查不到引号的时候
					res += str.substring(p1);
					break;
				}
			}

			res += str.substring(p1, p2);
			p1 = p2++;

			// 等待记录引号内容
			while( ~(p2 = str.indexOf(c, p2)) ) {
				if( str.charAt(p2 - 1) !== '\\' ) {
					p2++;
					break;
				} else {
					p2++;
				}
			}

			// 提取引号和其中的内容
			tmp = str.substring(p1, p2);

			if(fn) {
				res += fn(tmp);
			} else {
				res += tmp;
			}

			p1 = p2;

		}

		return res;
	}

	var strMap = {}, serial, tld = '(%#~@', trd = '@~#%)';
	function doUglify(str) {
		str = save(str, function(tmp) {
			serial = Math.random(), strMap[serial] = tmp
			return tld + serial + trd;
		})

		return str.replace(/([\s\S]+?);*\n+/g, '$1;\n')				// 在所有换行地方替换为;
					.replace(/([\s\S]+?\))[\s;]*(?=\{)/g, '$1')		// 去掉所有)和{之间的;
					.replace(/([\s\S]+?\{)([\s;]*)(?=[^;])/g, '$1 ')
					.replace(/[\s;]*\n+\s*/g, ';');
	}
	function uglify(str) {
		return reset( doUglify(str) );
	}
	function reset(str) {
		return str.replace(/\(%#~@([\d\.]+?)@~#%\)/g, function($0, $1) { return strMap[$1] || $0; });
	}

	// 待改善: 先replace, 每次提取所有字符串, 用随机编号代替, 放在{}中一一对应, 然后添加换行, 替换各种操作, 最后把字符串换回来
	function pretty(str) {
		var tab = '\t';
		str = uglify(str);
		return str.replace(/([\s\S]+?);/g, '$1;\n')					// 替换 ; 为 ;\n
					.replace(/([\s\S]+?[\{\}])(\s*);?/g, '$1\n') 	// 在 { 和 } 后追加 \n
					.replace(/([\s\S]+?)(for\s*\([\s\S]+?\))/g, function($0, $1, $2) {
						return $1 + $2.replace(/\n+/g, '')			// 删除 for 循环中的 \n
					})
					.replace(/.+;?\n/gm, function($0) {				// 缩进
						if( /^\s*\}/.test($0) ) tab = tab.replace(/\t/, '');
						$0 = tab + $0.replace(/^\s+/, '');
						if( /^\s+break;\s+$/.test($0) ) tab = tab.replace(/\t/, '');
						if( /\{\s*$/.test($0) ) tab += '\t';
						if( /^\s+$/g.test($0) ) $0 = '';
						$0 = $0.replace(/(^\s+case[^\n]+?:)/, function($0, $1) {
							tab += '\t';
							return $1 + '\n' + tab;
						});
						$0 = $0.replace(/(^\s+default\s*?:)/, function($0, $1) {
							tab += '\t';
							return $1 + '\n' + tab;
						})
						// console.log(`|${$0}|`)
						return $0;
					})
	}

	// 思路: 可以先用一个flag表示, 用indexOf查询, 遇到定界符左边 flag = -1, 再次遇到则为 -2, 遇到定界符右边则加1, 直到flag为0, 则说明是一个完整的块,然后做特殊标记, 方便后面正则匹配
	return function transform(html, opt) {
		opt = opt || {};
		opt.delimiter = opt.delimiter || ['<%', '%>'];
		opt.minify = opt.minify || 1;
		opt.uglify = opt.uglify || 0;

		var ld = opt.delimiter[0].replace(/([\+\-\?\.\[\]]+)/g, '\\\\$1'),
			rd = opt.delimiter[1].replace(/([\+\-\?\.\[\]]+)/g, '\\\\$1')
		var reg = new RegExp(ld + '[\\s\\S]+?' + rd + '|[\\s\\S]+?(?='+ ld +'|$)', 'g');
		var reg2 = new RegExp('^'+ ld +'|'+ rd +'$', 'g');

		var matches = html.match( reg ) || [];
		var res = '';

		matches.forEach(function(frag) {
			if( frag.indexOf(ld) === 0 ) {
				frag = frag.replace(reg2, '');	// 去除两边定界符
				switch( frag.charAt(0) ) {
					case '=':
						res += '_res += escape('+ frag.substring(1).trim() +');';
						break;
					case '-':
						res += '_res += ' + frag.substring(1).trim() + ';';
						break;
					default:
						frag = rmJsComment( frag );
						res += frag.trim();
				}
			} else {
				// html标签
				frag = es(frag);
				res += '_res += "' + (opt.minify ? frag : frag) + '";';
			}
		});
		res = 'var _res = "";with(data || {}) {' + res + '} return _res;' 

		return new Function('data', opt.uglify ? uglify(res) : pretty(res) );
	}
});

