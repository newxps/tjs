var assert = require('assert');
var tjs = require('../lib/tjs');

describe('quotation-mark', function() {
	it('单引号', function () {
		var tpl = `<%var a = '/*多行注释*/, "双引号", \\'单引号\\'';%><%-a%>`
		var str = tjs(tpl)();

		assert.equal(str, `/*多行注释*/, "双引号", '单引号'`)
	});

	it('双引号', function () {
		var tpl = `<%var a = "/*多行注释*/, \\"双引号\\", '单引号'";%><%-a%>`
		var str = tjs(tpl)();

		assert.equal(str, `/*多行注释*/, "双引号", '单引号'`)
	});

	it('反引号', function () {
		var tpl = '<%var a = `/*多行注释*/, "双引号", \'单引号\'`;%><%-a%>'
		var str = tjs(tpl)();

		assert.equal(str, `/*多行注释*/, "双引号", '单引号'`)
	});
});