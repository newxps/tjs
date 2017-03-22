
// 同理可扩展为 <%  %>, 并且可判断 var str = '<%abc%>';  和  <li data-id="<%=arr[i].id%>"> 的区别
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