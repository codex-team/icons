const fs = require('fs');

// read all files from icons directory
const files = fs.readdirSync('./icons');

// create an object for icons
const icons = {};

for (let file of files) {
    // create a name of file without extension  (e.g. 'icon-name')
    const name = file.split('.')[0];

    // push string content to object with key name
    icons[name] = fs.readFileSync(`./icons/${file}`, 'utf8');
}

// create directory dist if it doesn't exist
if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
}

// save icons to a file
fs.writeFileSync('./dist/icons.js', `(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.icons = factory());
}(this, (function () {
    'use strict';
    return ${JSON.stringify(icons)};
})));`);
