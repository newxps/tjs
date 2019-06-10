var assert = require('assert');
var tjs = require('..');

describe('regexp', function() {
  it(`/^[\u4e00-\u9fa5]+<%分隔符%>$/ 输出 'true'`, function() {
    var str = tjs('<%-/^[\u4e00-\u9fa5]+<%分隔符%>$/.test("你<%分隔符%>")%>')();
    assert.equal(str, 'true');
  });

  it(`<%-/2+3/+2/3/4%> 输出 '/2+3/0.16666666666666666'`, function() {
    var str = tjs('<%-/2+3/+2/3/4%>')();
    assert.equal(str, '/2+3/0.16666666666666666');
  });

  it(`<%-(/2+3/+2)/3/4%> 输出 'NaN'`, function() {
    var str = tjs('<%-(/2+3/+2)/3/4%>')();
    assert.equal(str, 'NaN');
  });

  it(`<%-/2+3/.test(2223)%> 输出 'true'`, function() {
    var str = tjs('<%-/2+3/.test(2223)%>')();
    assert.equal(str, 'true');
  });

  it(`<%/2"3+'"/gi%> 输出 空字符串`, function() {
    var str = tjs('<%/2"3+\'"/gi%>')();
    assert.equal(str, '');
  });

  it(`<%-void /ab"c/%> 输出 空字符串`, function() {
    var str = tjs('<%-void /ab"c/%>')();
    assert.equal(str, '');
  });

  it(`<%-typeof /ab"%>c/%> 输出 'object'`, function() {
    var str = tjs('<%-typeof /ab"%>c/%>')();
    assert.equal(str, 'object');
  });

  it(`<%var atypeof = 12;%><%-atypeof / 2%> 输出 '6'`, function() {
    var str = tjs('<%var atypeof = 12;%><%-atypeof / 2%>')();
    assert.equal(str, '6');
  });

  it(`<%-typeof(  /ab"%>c/)%> 输出 'object'`, function() {
    var str = tjs('<%-typeof(  /ab"%>c/)%>')();
    assert.equal(str, 'object');
  });

  it(`<%-delete name%> 输出 'true'`, function() {
    var str = tjs(`<%-delete name%>`)();
    assert.equal(str, 'true');
  });

  it(`<%typeof  'a' === 'string'?%>It's string<%:%>undefined<%;%> 输出 'It's string'`, function() {
    var str = tjs(`<%typeof  'a' === 'string'?%>It's string<%:%>undefined<%;%>`)();
    assert.equal(str, `It's string`);
  });

  it(`<%/ab"c/.test('ab"cd') ?%>true<%:%>false<%;%> 输出 'true'`, function() {
    var str = tjs(`<%/ab"c/.test('ab"cd') ?%>true<%:%>false<%;%>`)();
    assert.equal(str, `true`);
  });
});