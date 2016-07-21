var test = require('tape')
var memdb = require('memdb')
var hyperdrive = require('hyperdrive')
var concat = require('concat-stream')
var checkout = require('../')

test('checkout', function (t) {
  t.plan(5)
  var drive = hyperdrive(memdb())
  var archive = drive.createArchive(null, { live: true })
  var data = [
    { 'hello.txt': 'HI' },
    { 'hello.txt': 'WHAT', 'index.html': '<h1>hey</h1>' },
    { 'hello.txt': '!' }
  ]
  var expected = [
    { name: 'hello.txt', body: 'HI' },
    { name: 'hello.txt', body: 'WHAT' },
    { name: 'index.html', body: '<h1>hey</h1>' },
    { name: 'hello.txt', body: '!' }
  ]
  ;(function next () {
    if (data.length === 0) return check()
    var files = data.shift()
    var pending = 1
    Object.keys(files).forEach(function (key) {
      pending++
      archive.createFileWriteStream(key)
        .once('finish', done)
        .end(files[key])
    })
    done()
    function done () { if (--pending === 0) next() }
  })()
  function check () {
    archive.list({ live: false }, function (err, files) {
      t.error(err)
      files.forEach(function (file) {
        var e = expected.shift()
        var c = checkout(archive, file.content.blockOffset)
        c.createFileReadStream(file.name).pipe(concat(function (body) {
          t.equal(body.toString(), e.body, e.name)
        }))
      })
    })
  }
})
