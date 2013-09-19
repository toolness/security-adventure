#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var PROBLEMS = {
  'redos': 'Regular Expression Denial of Service',
  'reflected-xss': 'Reflected Cross-Site Scripting',
  'xss-cookie-theft': 'Cross-Site Scripting Cookie Theft',
  'csp': 'Content Security Policy'
};

var problem = process.argv[2];

function help() {
  console.log("Usage: verify.js <problem>\n");
  console.log("Valid problems:\n");
  Object.keys(PROBLEMS).forEach(function(name) {
    console.log("  " + name + " - " + PROBLEMS[name]);
  });
  console.log("  all - Verify all of the above\n");
}

if (!(problem in PROBLEMS) && problem != 'all') {
  help();
  process.exit(1);
}

var testDir = path.normalize(path.join(__dirname, '..', 'test'));
var baseTests = fs.readdirSync(testDir)
  .filter(function(f) { return /\.js$/.test(f); })
  .map(function(f) { return path.join(testDir, f); });
var problemTests = ((problem == 'all') ? Object.keys(PROBLEMS) : [problem])
  .map(function(p) { return path.join(testDir, 'security', p + '.js'); });
var allTests = baseTests.concat(problemTests);
var problemName = (problem == 'all'
                            ? 'all the problems'
                            : 'the ' + PROBLEMS[problem] + ' problem');

console.log("Now ensuring your app retains existing functionality while " +
            "solving " + problemName + "...\n");

var child = spawn('tap-prettify', ['--stderr'].concat(allTests));

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
child.on('exit', function(code) {
  if (code == 0) {
    console.log("Congratulations! Your app has solved " +
                problemName + " while retaining existing functionality.\n");
  } else {
    console.log("Alas, your app has not solved " + problemName + 
                " while retaining existing functionality.\n");
  }
  process.exit(code);
});
