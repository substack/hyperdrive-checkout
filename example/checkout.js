var hyperdrive = require('hyperdrive')
var namedArchives = require('hyperdrive-named-archives')
var level = require('level')
var checkout = require('../')

var named = namedArchives({
  drive: hyperdrive(level('/tmp/drive.db')),
  db: level('/tmp/db')
})
var archive = named.createArchive('whatever')

var block = Number(process.argv[2])
var c = checkout(archive, block)

if (process.argv[3] === 'list') {
  c.list({ live: false }, function (err, files) {
    console.log(files)
  })
} else if (process.argv[3] === 'show') {
  var name = process.argv[4]
  c.createFileReadStream(name).pipe(process.stdout)
}
