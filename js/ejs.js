




var IS_SINGLE_QUOTE = 1;
var IS_DOUBLE_QUOTE = 2;
var IS_LINE_COMMENT = 3;
var IS_BLOCK_COMMENT = 4;
var IS_HTML = 5;

function transform (tpl, opt) {
	var ld = opt.open || '<%';
	var rd = opt.close || '%>';
	var keyChars = ['"', '\'', '//', '/*', ld];

	var state = IS_HTML;
	
	var i = 0, j = 0, res = '', frag = '', tmp, ch;

	while (i < tpl.length) {
		tmp = getNext(tpl, i);
		ch = tmp[0];

		tpl.indexOf(ld)

		switch (tmp[0]) {
			case '"':
				state = IS_DOUBLE_QUOTE;


		}

		if (state === IS_HTML) {
			if (str.charAt)

		} else {
			// js内部

		}
	}



	function getNext (str, i) {
		i = i || 0;

		var tmp = keyChars.map(function (c) {
			return [c, str.indexOf(c, i)];
		});
		
		return tmp.reduce(function (pre, cur) {
			return pre[1] < cur[1] ? pre : cur;
		});
	}

}








