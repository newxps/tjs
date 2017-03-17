;(function(factory) {
	if(typeof module === 'object' && module.exports) {
		module.exports = factory();
	} else {
		window.tpl = factory();
	}

})(function() {
	// function encodeHTML(html) {
	// 	return String(html).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;').replace(/`/g, '&#96;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
	// }
	// function rmJsComment(str) {
	// 	return String(str).replace(/\/\/.*?\n/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
	// }
	
	// // 对双引号和\n转义
	// function es(str) {
	// 	return String(str).replace(/"/g, '\\"').replace(/\n/g, '\\n');
	// }

	// return function transform(html) {
	// 	var callee = arguments.callee
	// 	var ld = callee.ld || '<%', rd = callee.rd || '%>';
	// 	var reg = new RegExp(ld + '[\\s\\S]+?' + rd + '|[\\s\\S]+?(?='+ ld +'|$)', 'g');
	// 	var reg2 = new RegExp('^'+ ld +'|'+ rd +'$', 'g');
	// 	var matches = html.match( reg ) || [];
	// 	var res = '';
	// 	matches.forEach(function(frag) {
	// 		if( frag.indexOf(ld) === 0 ) {
	// 			frag = frag.replace(reg2, '');	// 去除两边定界符
	// 			switch( frag.charAt(0) ) {
	// 				case '=': res += '_res += encodeHTML('+ frag.substring(1).trim() +');\n';
	// 					break;
	// 				case '-': res += '_res += ' + frag.substring(1).trim() + ';\n';
	// 					break;
	// 				default: res += rmJsComment( frag ).trim() + '\n';
	// 			}
	// 		} else {
	// 			// html标签
	// 			res += '_res += "' + es(frag) + '";\n';
	// 		}
	// 	});
	// 	res = 'var _res = "";\nwith(data) {\n' + res + '}\n return _res;' 
	// 	return new Function('data', res );
	// }

	function encodeHTML(html) {
	    return String(html).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;').replace(/`/g, '&#96;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
	}
	function rmJsComment(str) {
	    return String(str).replace(/\/\/.*?\n/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
	}

	// 对双引号和\n转义
	function es(str) {
	    return String(str).replace(/"/g, '\\"').replace(/\n/g, '\\n');
	}

	var strMap, tld = '%#~@', trd = '@~#%';
	function _save(str) {
	    strMap = {'single': "''", 'double': '""'};
	    var serial
	    str = String(str).replace(/([^\\])""/g, function($0, $1) {
	                            return $1 + tld + 'double' + trd;
	                        })
	                        .replace(/([^\\])''/g, function($0, $1) {
	                            return $1 + tld + 'single' + trd;
	                        })
	                        .replace(/([^\\])((['"])[\s\S]*?[^\\]\3)/g, function($0, $1, $2, $3) {
	                            serial = Math.random(), strMap[serial] = $2;
	                            return $1 + tld + serial + trd;
	                        })
	                        // .replace(/\[[\s\S]+\]/)
	    return str;
	}
	function _uglify(str) {
	    str = _save(str)
	    return str.replace(/([\s\S]+?);*\n+/g, '$1;\n')				// 在所有换行地方替换为;
	                .replace(/([\s\S]+?\))[\s;]*(?=\{)/g, '$1')		// 去掉所有)和{之间的;
	                .replace(/([\s\S]+?\{)([\s;]*)(?=[^;])/g, '$1 ')
	                .replace(/[\s;]*\n+\s*/g, ';');
	}
	function uglify(str) {
	    return _reset( _uglify(str) );
	}
	function _reset(str) {
	    return str.replace(/%#~@(.+?)@~#%/g, function($0, $1) { return strMap[$1] || $0; });
	}
	// 待改善: 先replace, 每次提取所有字符串, 用随机编号代替, 放在{}中一一对应, 然后添加换行, 替换各种操作, 最后把字符串换回来
	function beautify(str) {
	    var tab = '\t';
	    str = _uglify(str);
	    str = str.replace(/([\s\S]+?);/g, '$1;\n')					// 替换 ; 为 ;\n
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
	    return _reset(str);
	}
	var config = {
	    delimiter: ['<%', '%>'],
	    // uglifyJs: true,
	    uglifyHTML: true
	}
	//
	return function transform(html) {
	    var ld = config.delimiter[0].replace(/([\+\-\?\.\[\]]+)/g, '\\\\$1'),
	        rd = config.delimiter[1].replace(/([\+\-\?\.\[\]]+)/g, '\\\\$1')
	    var reg = new RegExp(ld + '[\\s\\S]+?' + rd + '|[\\s\\S]+?(?='+ ld +'|$)', 'g');
	    var reg2 = new RegExp('^'+ ld +'|'+ rd +'$', 'g');
	    var matches = html.match( reg ) || [];
	    var res = '';
	    matches.forEach(function(frag) {
	        if( frag.indexOf(ld) === 0 ) {
	            frag = frag.replace(reg2, '');	// 去除两边定界符
	            switch( frag.charAt(0) ) {
	                case '=':
	                    res += '_res += encodeHTML('+ frag.substring(1).trim() +');';
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
	            res += '_res += "' + (config.uglifyHTML ? frag : frag) + '";';
	        }
	    });
	    res = 'var _res = "";with(data || {}) {' + res + '} return _res;' 

	    // window.res = uglify(res);
	    return new Function('data', config.uglifyJs ? uglify(res) : beautify(res) );
	}
});

