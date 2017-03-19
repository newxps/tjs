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



