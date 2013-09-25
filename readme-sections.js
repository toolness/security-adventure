var fs = require('fs');

var SECTION_MARKER = /^\<\!-- section: ([a-z\-]+) --\>$/;

var readme = fs.readFileSync(__dirname + '/README.md', 'utf8');
var sections = {prologue: []};
var currentSection = 'prologue';

readme.split('\n').forEach(function(line) {
  var match = line.match(SECTION_MARKER);
  if (match) {
    sections[currentSection] = sections[currentSection].join('\n');
    currentSection = match[1];
    sections[currentSection] = [];
  } else {
    sections[currentSection].push(line);
  }
});

sections[currentSection] = sections[currentSection].join('\n');

module.exports = sections;
