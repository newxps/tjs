
const fs = require('fs');
const path = require('path')

const tjs = require('../index');

var tpl = fs.readFileSync(path.join(__dirname, 'page.ejs')).toString();


tjs(tpl);