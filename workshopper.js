const argv       = require('optimist').argv
    , fs         = require('fs')
    , path       = require('path')
    , mkdirp     = require('mkdirp')

const showMenu  = require('./menu')
    , printText = require('./print-text')
    , repeat    = require('./term-util').repeat
    , bold      = require('./term-util').bold
    , red       = require('./term-util').red
    , green     = require('./term-util').green
    , yellow    = require('./term-util').yellow
    , center    = require('./term-util').center

const defaultWidth = 65

function Workshopper (options) {
  if (!(this instanceof Workshopper))
    return new Workshopper(options)

  if (typeof options != 'object')
    throw new TypeError('need to provide an options object')

  if (typeof options.name != 'string')
    throw new TypeError('need to provide a `name` String option')

  if (typeof options.title != 'string')
    throw new TypeError('need to provide a `title` String option')

  if (typeof options.appDir != 'string')
    throw new TypeError('need to provide an `appDir` String option')

  this.name        = options.name
  this.title       = options.title
  this.subtitle    = options.subtitle
  this.menuOptions = options.menu
  this.width       = typeof options.width == 'number' ? options.width : defaultWidth

  this.problems    = options.problems
  this.showProblem = options.showProblem
  this.showHelp    = options.showHelp
  this.preRun      = options.preRun
  this.appDir      = options.appDir
  this.dataDir     = path.join(
      process.env.HOME || process.env.USERPROFILE
    , '.config'
    , this.name
  )

  mkdirp.sync(this.dataDir)
}

Workshopper.prototype.init = function () {
  if (argv.h || argv.help || argv._[0] == 'help')
    return this._printHelp()

  if (argv.v || argv.version || argv._[0] == 'version')
    return console.log(this.name + '@' + require(path.join(this.appDir, 'package.json')).version)

  if (argv._[0] == 'list') {
    return this.problems().forEach(function (name) {
      console.log(name)
    })
  }

  if (argv._[0] == 'current')
    return console.log(this.getData('current'))

  if (argv._[0] == 'select' || argv._[0] == 'print') {
    return onselect.call(this, argv._.length > 1
      ? argv._.slice(1).join(' ')
      : this.getData('current')
    )
  }

  var run = argv._[0] == 'run'
  if (argv._[0] == 'verify' || run)
    return this.verify(run)

  if (this.preRun) return this.preRun(this.printMenu.bind(this));

  this.printMenu()
}

Workshopper.prototype.verify = function (run) {
  var current = this.getData('current')
    , setupFn
    , dir
    , setup

  if (!current) {
    console.error('ERROR: No active problem. Select a challenge from the menu.')
    return process.exit(1)
  }
  
  dir     = this.dirFromName(current)
  setupFn = require(dir + '/setup.js')

  if (!setupFn.async) {
    setup = setupFn(run)
    return setTimeout(this.runSolution.bind(this, setup, dir, current, run), setup.wait || 1)
  }

  setupFn(run, function (err, setup) {
    if (err) {
      console.error('An error occurred during setup:', err)
      return console.error(err.stack)
    }
    setTimeout(this.runSolution.bind(this, setup, dir, current, run), setup.wait || 1)
  }.bind(this))
}

Workshopper.prototype.printMenu = function () {
  var menu = showMenu({
      name      : this.name
    , title     : this.title
    , subtitle  : this.subtitle
    , width     : this.width
    , completed : this.getData('completed') || []
    , problems  : this.problems()
    , menu      : this.menuOptions
  })
  menu.on('select', onselect.bind(this))
  menu.on('exit', function () {
    console.log()
    process.exit(0)
  })
  menu.on('help', function () {
    console.log()
    return this._printHelp()
  }.bind(this))
}

Workshopper.prototype.getData = function (name) {
  var file = path.resolve(this.dataDir, name + '.json')
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {}
  return null
}

Workshopper.prototype.updateData = function (name, fn) {
  var json = {}
    , file

  try {
    json = this.getData(name)
  } catch (e) {}

  file = path.resolve(this.dataDir, name + '.json')
  fs.writeFileSync(file, JSON.stringify(fn(json)))
}

Workshopper.prototype.runSolution = function (setup, dir, current, run) {
  BLAH;
}

function solutionCmd (dir, setup) {
  BLAH;
}

function submissionCmd (setup) {
  BLAH;
}

Workshopper.prototype._printHelp = function () {
  this._printUsage()

  if (this.showHelp)
    this.showHelp();
}

Workshopper.prototype._printUsage = function () {
  printText(this.name, this.appDir, path.join(__dirname, './usage.txt'))
}

function onselect (name) {
  this.updateData('current', function () {
    return name
  })

  this.showProblem(name);

  console.log(
    bold('\n » To print these instructions again, run: `' + this.name + ' print`.'))
  console.log(
    bold(' » To verify your program, run: `' + this.name + ' verify app.js`.'))
  if (this.showHelp) {
    console.log(
      bold(' » For help with this problem or with ' + this.name + ', run:\n   `' + this.name + ' help`.'))
  }
  console.log()
}

module.exports = Workshopper
