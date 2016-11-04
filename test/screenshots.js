const test = require("prova")
const screenshots = require("../lib/screenshots")

const urls = [
  'foo.com',
  'bar.com',
  'qux.com',
  'span.com',
  'eggs.com',
  'yo.com',
  'yolo.com',
  'yoyo.com',
  'hola.com',
  'brrr.com'
]

test('saving & getting blobs', function (t) {
  const flush = screenshots.test()
  t.plan(5)

  screenshots.add('http://foo.com/#bar', new Blob(), (error, id) => {
    t.error(error)
    t.ok(id)

    screenshots.get('foo.com', (error, row) => {
      t.error(error)
      t.equal(row.id, id)
      t.ok(row.blob)
      flush()
    })
  })
})

test('when limit (1) is hit, it should delete least recently saved record', function (t) {
  const flush = screenshots.test()
  t.plan(18)

  populate(error => {
    t.error(error)

    screenshots.add('http://azer.bike/#bar', new Blob(), (error, id) => {
      t.error(error)
      t.ok(id)

      screenshots.get('foo.com', (error, row) => {
        t.error(error)
        t.notOk(row)

        screenshots.get('azer.bike', (error, row) => {
          t.error(error)
          t.equal(row.id, id)
          t.ok(row.blob)

          const expected = urls.slice(1).concat(['azer.bike'])
          let ctr = -1
          screenshots.store.all((error, row) => {
            t.error(error)
            if (!row) return flush()
            t.equal(row.value.url, expected[++ctr])
            row.continue()
          })
        })
      })
    })
  })
})

function populate (callback) {
  (function next (i) {
    if (i >= urls.length) return callback()

    screenshots.add(urls[i], new Blob(), error => {
      if (error) return callback(error)
      next(i+1)
    })
  }(0))
}
