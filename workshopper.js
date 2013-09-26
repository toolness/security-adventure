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
  this.preMenu     = options.preMenu
  this.runVerifier = options.runVerifier
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

  if (argv._[0] == 'verify')
    return this.verify()

  if (this.preMenu) return this.preMenu(this.printMenu.bind(this));

  this.printMenu()
}

Workshopper.prototype.verify = function (run) {
  var current = this.getData('current')
  var filename = path.resolve(process.cwd(), argv._[1]);

  if (!current) {
    console.error('ERROR: No active problem. Select a challenge from the menu.')
    return process.exit(1)
  }
  
  this.runVerifier(current, filename, function onSuccess() {
    this.updateData('completed', function (xs) {
      if (!xs) xs = []
      var ix = xs.indexOf(current)
      return ix >= 0 ? xs : xs.concat(current)
    })
        
    completed = this.getData('completed') || []
    
    remaining = this.problems().length - completed.length
    if (remaining === 0) {
      console.log('You\'ve finished all the challenges! Hooray!\n')
    } else {
      console.log(
          'You have '
        + remaining
        + ' challenge'
        + (remaining != 1 ? 's' : '')
        + ' left.'
      )
      console.log('Type `' + this.name + '` to show the menu.\n')
    }
  }.bind(this));
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
