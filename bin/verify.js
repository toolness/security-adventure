#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var bold = require('../lib/term-util').bold;

var TEST_PROBLEM_ONLY = 'TEST_PROBLEM_ONLY' in process.env;
var TAP_PRETTIFY = path.normalize(path.join(__dirname, '..', 'node_modules',
                                            'tap-prettify', 'bin',
                                            'tap-prettify.js'));
var PROBLEMS = {
  'redos': 'RegExp Denial of Service',
  'httponly': 'HttpOnly Cookie',
  'csp': 'Content Security Policy',
  'html-escaping': 'HTML Escaping',
  'csrf': 'Cross-Site Request Forgery'
};

function help() {
  console.log("Usage: verify.js <problem>\n");
  console.log("Valid problems:\n");
  Object.keys(PROBLEMS).forEach(function(name) {
    console.log("  " + name + " - " + PROBLEMS[name]);
  });
  console.log("  all - Verify all of the above\n");
}

function verifyMain(problem, cb) {
  if (!(problem in PROBLEMS) && problem != 'all') {
    help();
    return cb(1);
  }

  var testDir = path.normalize(path.join(__dirname, '..', 'test'));
  var baseTests = fs.readdirSync(testDir)
    .filter(function(f) { return /\.js$/.test(f); })
    .map(function(f) { return path.join(testDir, f); });
  var problemTests = ((problem == 'all') ? Object.keys(PROBLEMS) : [problem])
    .map(function(p) { return path.join(testDir, 'problems', p + '.js'); });
  var allTests = problemTests.concat(TEST_PROBLEM_ONLY ? [] : baseTests);
  var problemName = (problem == 'all'
                              ? bold('all the problems')
                              : 'the ' + bold(PROBLEMS[problem]) + ' problem');

  console.log("Now ensuring your app retains existing functionality while " +
              "solving\n" + problemName + "...\n");

  var child = spawn(process.execPath,
                    [TAP_PRETTIFY, '--stderr'].concat(allTests));

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  child.on('exit', function(code) {
    console.log();
    if (code == 0) {
      console.log("Congratulations! Your app has solved " +
                  problemName + " while\n" +
                  "retaining existing functionality.\n");
    } else {
      console.log("Alas, your app has not solved " + problemName + 
                  " while\nretaining existing functionality.\n");
    }
    cb(code);
  });
}

module.exports = verifyMain;
module.exports.PROBLEMS = PROBLEMS;

if (!module.parent) verifyMain(process.argv[2], process.exit.bind(process));
