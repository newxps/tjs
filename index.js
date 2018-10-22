
const acorn = require('acorn');
const frame = require('@babel/code-frame').codeFrameColumns;

const tjs = require('./lib/tjs.js');


module.exports = function (tpl, opt = {}) {
	let {
		debug = true
	} = opt;
	
	let compiled;
	if (debug) {
		compiled = function (code, mappingList) {
			try {
				acorn.parse(code, { ecmaVersion: 5 });
			} catch (e) {
				// 'var _res = [];\n...' 和 'function anonymous ()...' 会占58个字符串
				let pos = getPosInTpl(e.pos - 58, mappingList);

				// console.log('\n-------------\n', tpl.substring(pos - 30, pos), '^', tpl.substring(pos, pos + 30), '\n-------------\n', pos);

				let loc = getLineColumn(tpl, pos);

				let res = frame(tpl, {
					start: loc
				}, {
					linesAbove: 5,
					linesBelow: 5,
					highlightCode: true,
				});

				console.log(res);

				throw e;
			}
		}
	}

	return tjs(tpl, { compiled })
}

// 通过映射表定位模板位置
function getPosInTpl (pos, list) {
	let cur, next;

	for (let i = 0, len = list.length; i < len - 1; i++) {
		cur = list[i], next = list[i + 1];

		if (pos >= cur[1] && pos < next[1]) {
			return cur[0] + pos - cur[1];
		}
	}
	return pos;
}

// 通过位置返回代码中的行列号
function getLineColumn (code, pos) {
	let i = 0, br = '\n', line = 1, brPos = -1;
	while (~(i = code.indexOf(br, i)) && i <= pos)
		line++, brPos = i++;
		
	return {
		line,
		column: pos - brPos
	}
}