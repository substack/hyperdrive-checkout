# hyperdrive-checkout

checkout previous snapshots of files in a hyperdrive

This module depends on an [upstream hyperdrive patch][1].

[1]: https://github.com/mafintosh/hyperdrive/pull/89

# example

``` js
var hyperdrive = require('hyperdrive')
var namedArchives = require('hyperdrive-named-archives')
var level = require('level')
var checkout = require('hyperdrive-checkout')

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
```

# api

``` js
var checkout = require('hyperdrive-checkout')
```

## var c = checkout(archive, block)

Return a cursor `c` for the `archive` at `block`.

The cursor `c` has a read-only subset of the hyperdrive archive API.

# install

```
npm install hyperdrive-checkout
```

# license

BSD
