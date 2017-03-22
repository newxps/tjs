/**
*
*	created by fanlinfeng
*	github.com/flfwzgl
*
*/


;(function(global, factory) {
	if(typeof module === 'object' && module.exports) {
		module.exports = factory();
	} else {
		global.pretty = factory();
	}
})(typeof window !== "undefined" ? window : this, function() {

	// 还有问题, 待完善
	function saveQuote(str, fn) {
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
				if( str.charAt(p2 - 1) == '\\' && str.charAt(p2 - 2) !== '\\' ) {
					p2++;
				} else {
					p2++;
					break;
				}
			}

			// 提取引号和其中的内容
			tmp = str.substring(p1, p2);

			if(fn) {
				res += fn(tmp);
			} else {
				res += tmp;
			}

			if(p2 === -1) {
				break;
			} else {
				p1 = p2;
			}
		}

		return res;
	}

	function pretty(str) {
		var tab = '\t';
		return str.replace(/([^;]+?);/g, '$1;\n')
					.replace(/([\s\S]+?\})(\s*);?/g, '$1\n') 							// 在 } 后追加 \n
					.replace(/([^{]+?\{)\s*([^\s}])/g, '$1\n$2')						// {后面存在非空字符, 则换行
					.replace(/(if)\s*(\([^()]+\))\s*([^{])/g, '$1 $2 $3')				// 如果if(.+)后面不是{, 则换行
					.replace(/(return[^\n]*)\}/g, '$1\n}')								// return abc} 中'}'之前换行 
					.replace(/(\w)([+\-*/])(\w)/g, '$1 $2 $3')							// 在a+a - * / 两边添加空格
					.replace(/\s*([+\-*/]\={1,3})\s*/g, ' $1 ')
					.replace(/\s*([?:]|\|\|)\s*/g, ' $1 ')
					.replace(/,\s*/g, ', ')
					// .replace(/\s*function/g, '\n')
					.replace(/([\s\S]+?)(for\s*\([\s\S]+?\))/g, function($0, $1, $2) {	// 删除 for 循环中的 \n
						return $1 + $2.replace(/\n+/g, '')							
					})
					.replace(/([^r])\s*\(([^()]+)\)/g, function($0, $1, $2) {			// 找出非for循环的(), 且这个()中不能再包含(), 然后删除其中的;和\n
						return $1 + '(' + $2.replace(/[;\n]/g, '').replace(/\/\*[\s\S]*\*\//g, '') + ')';
					})
					.replace(/.+;?\n/gm, function($0) {				
						// 缩进
						if( /^\s*\}/.test($0) ) tab = tab.replace(/\t/, '');
						$0 = tab + $0.replace(/^\s+/, '');
						if( /^\s+break;\s+$/.test($0) ) tab = tab.replace(/\t/, '');
						if( /\{\s*$/.test($0) ) tab += '\t';
						if( /^\s+$/g.test($0) ) $0 = '';
						$0 = $0.replace(/(^\s+case)[^\n]+?: +/, function($0, $1) {
							tab += '\t';
							return $1 + ':' + '\n' + tab;
						});
						$0 = $0.replace(/(^\s+default)\s*?:/, function($0, $1) {
							tab += '\t';
							return $1 + ':' + '\n' + tab;
						})
						// console.log(`|${$0}|`)
						return $0;
					})
	}

	function uglify(str) {
		return str.replace(/([\s\S]+?);*\n+/g, '$1;\n')				// 在所有换行地方替换为;
				.replace(/([\s\S]+?\))[\s;]*(?=\{)/g, '$1')			// 去掉所有)和{之间的;
				.replace(/([\s\S]+?\{)([\s;]*)(?=[^;])/g, '$1 ')
				.replace(/[\s;]*\n+\s*/g, ';');
	}


	var strMap = {},
		serial = 0,
		ld = '%#~@~#',
		rd = '#~@~#%'

	var reg = new RegExp(ld + '(\\d+)' + rd, 'g');
	
	return function(str) {
		str = saveQuote(str, function(frag) {
			strMap[++serial] = frag;
			return ld + serial + rd;
		});

		str = uglify(str);

		str = pretty(str);

		return str.replace(reg, function($0, $1) {
			return strMap[$1] || $0;
		});

	}
})












