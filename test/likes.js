const test = require("prova")
const likes = require("../lib/likes")

const data = ['yo.lo', 'wikipedia.org', 'azer.bike', 'foo.com', 'bar.org']

test('like', function (t) {
  const flush = likes.test()
  t.plan(6)

  likes.like('http://yo.lo', error => {
    t.error(error)

    likes.like('http://yo.lo', error => {
      t.error(error)

      likes.get('yo.lo', (error, row) => {
        t.error(error)
        t.ok(row)
        t.ok(row.likedAt > Date.now() - 10000)
        t.equal(row.url, 'yo.lo');
        flush()
      })
    })
  })
})

test('unlike', function (t) {
  const flush = likes.test()
  t.plan(4)

  likes.like('http://yo.lo', error => {
    t.error(error)

    likes.unlike('yo.lo', error => {
      t.error(error)

      likes.get('yo.lo', (error, row) => {
        t.error(error)
        t.notOk(row)
        flush()
      })
    })
  })
})

test('all', function (t) {
  const flush = likes.test()
  t.plan(16)

  populate(error => {
    t.error(error)

    let ctr = -1
    likes.all((error, row) => {
      t.error(error)
      if (!row) return flush()

      t.ok(++ctr < data.length)
      t.equal(data[data.length - 1 - ctr], row.value.url)

      row.continue()
    })
  })
})

function populate (callback) {
  (function next (i) {
    if (i >= data.length) return callback()

    likes.like(data[i], error => {
      if (error) return callback(error)
      next(i+1)
    })
  }(0))
}
