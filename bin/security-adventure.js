#!/usr/bin/env node

var PROBLEMS = require('./verify').PROBLEMS;
var showMenu = require('../menu');
var readmeSections = require('../readme-sections');

function printMenu() {
  var menu = showMenu({
    name: 'security-adventure',
    title: 'Security Adventure!',
    width: 65,
    completed: [PROBLEMS.redos],
    problems: Object.keys(PROBLEMS).map(function(key) {
      return PROBLEMS[key];
    })
  });

  menu.on('exit', function() {
    process.exit(0);
  });

  menu.on('help', function() {
    console.log(readmeSections.help);
    process.exit(0);
  });

  menu.on('select', function(name) {
    var id = problemIdFromName(name);

    console.log(readmeSections[id]);
  });
}

function problemIdFromName(name) {
  for (var id in PROBLEMS)
    if (PROBLEMS[id] == name) return id;
}

printMenu();
