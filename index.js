var collect = require('collect-stream')
var readonly = require('read-only-stream')
var through = require('through2')
var duplexify = require('duplexify')

module.exports = Checkout

function Checkout (archive, block) {
  if (!(this instanceof Checkout)) return new Checkout(archive, block)
  this._archive = archive
  this._block = block
  this.metadata = archive.metadata
}

Checkout.prototype.get = function (index, cb) {
  if (index > this._block) {
    var err = new Error('block out of checkout range')
    process.nextTick(function () { cb(err) })
  } else this._archive.get(index, cb)
}

Checkout.prototype.list = function (opts, cb) {
  var self = this
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  var r = through.obj(write)
  self._archive.list(opts).pipe(r)
  if (cb) collect(r, cb)
  return readonly(r)
  function write (row, enc, next) {
    if (row.content.blockOffset <= self._block) {
      next(null, row)
    } else next()
  }
}

Checkout.prototype.createFileReadStream = function (opts) {
  var self = this
  if (typeof opts === 'string') {
    opts = { name: opts }
  }
  var d = duplexify()
  self.lookup(opts.name, function (err, entry) {
    if (err) return d.emit('error', err)
    var r = self._archive.createFileReadStream(entry, opts)
    d.setReadable(r)
  })
  return d
}

Checkout.prototype.lookup = function (name, cb) {
  var entries = this.list({live: false})
  var result = null

  entries.on('data', function (data) {
    if (data.name !== name) return
    result = data
  })

  entries.on('error', done)
  entries.on('close', done)
  entries.on('end', done)

  function done (err) {
    if (result) return cb(null, result)
    cb(err || new Error('Could not find entry'))
  }
}
