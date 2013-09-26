var fs = require('fs');
var path = require('path');

var SECTION_MARKER = /^\<\!-- section: ([a-z\-]+) --\>/;

var filename = path.normalize(path.join(__dirname, '..', 'README.md'));
var readme = fs.readFileSync(filename, 'utf8');
var sections = {prologue: []};
var currentSection = 'prologue';

readme.split('\n').forEach(function(line) {
  var match = line.match(SECTION_MARKER);
  if (match) {
    sections[currentSection] = sections[currentSection].join('\n');
    currentSection = match[1];
    sections[currentSection] = [];
  } else {
    if (/Run `bin\/verify.js (.+)` to verify that your solution works/.test(line))
      return;
    sections[currentSection].push(line);
  }
});

sections[currentSection] = sections[currentSection].join('\n');

module.exports = sections;
