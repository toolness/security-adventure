#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var verify = require('./verify');
var Workshopper = require('../workshopper');
var readmeSections = require('../readme-sections');

var PROBLEMS = verify.PROBLEMS;

function problemIdFromName(name) {
  for (var id in PROBLEMS)
    if (PROBLEMS[id] == name) return id;
  throw new Error("unknown problem name: " + name);
}

Workshopper({
  name: 'security-adventure',
  title: 'Security Adventure!',
  appDir: path.normalize(path.join(__dirname, '..')),
  problems: function() {
    return Object.keys(PROBLEMS).map(function(key) {
      return PROBLEMS[key];
    });
  },
  preMenu: function(cb) {
    if (fs.existsSync('app.js')) return cb();
    var copyCmd = process.platform == 'win32' ? 'copy' : 'cp';
    var appVuln = path.normalize(path.join(__dirname, '..',
                                           'app-vulnerable.js'));
    console.log("Please run the following command:\n");
    console.log("  " + copyCmd + " " + appVuln + " app.js");
    console.log(readmeSections.app);
    console.log('When you are ready to begin the adventure, run ' +
                this.name + ' again.\n');
    process.exit(1);
  },
  runVerifier: function(name, successCb) {
    verify(problemIdFromName(name), function(exitCode) {
      if (!exitCode) return successCb();
      process.exit(exitCode);
    });
  },
  showHelp: function() {
    console.log(readmeSections.help);
  },
  showProblem: function(name) {
    console.log(readmeSections[problemIdFromName(name)]);
  }
}).init();
