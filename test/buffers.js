const test = require("prova")
const buffers = require("../lib/buffers")

const data = [
  '',
  'foo.com',
  'https://bar.com',
  'https://www.qux.com/'
]

test('creating an empty buffer', function (t) {
  const flush = buffers.test()

  t.plan(6)

  buffers.create(333, '', (error, id) => {
    t.error(error)

    buffers.get(id, (error, row) => {
      t.error(error);
      if (!row) return flush()
      t.ok(row)
      t.equal(row.url, '')
      t.equal(row.window, 333);
      t.ok(row.createdAt > Date.now() - 10000)
    })
  })
})

test('listing all buffers', function (t) {
  const flush = buffers.test()
  t.plan(22)

  const expected = [
    'qux.com', 'bar.com', 'foo.com', ''
  ]

  createSomeBuffers(314, error => {
    t.error(error)

    let ctr = -1;
    buffers.all(314, (error, result) => {
      t.error(error)
      if (!result) return flush()

      t.ok(ctr < 4)
      t.equal(result.value.url, expected[++ctr]);
      t.equal(result.value.window, 314)
      t.ok(result.value.createdAt > Date.now() - 10000)
      result.continue()
    })
  })
})

test('all should return default buffer when there isnt any', function (t) {
  const flush = buffers.test()
  t.plan(5)

  buffers.all(333, (error, row) => {
    t.error(error)
    if (!row) return flush()

    t.equal(row.value.id, 1)
    t.equal(row.value.url, '');
    t.equal(row.value.window, 333);
    row.continue()
  })
})

test('finding a buffer by window+url', function (t) {
  const flush = buffers.test()

  t.plan(7)

  buffers.create(333, 'yolo.com/?', (error, id) => {
    t.error(error)

    buffers.create(444, 'yolo.com', (error, id) => {
      t.error(error)

      buffers.find(333, 'yolo.com/', (error, row) => {
        t.error(error)
        if (!row) return flush()

        t.ok(row)
        t.equal(row.url, 'yolo.com')
        t.equal(row.window, 333)
        t.ok(row.createdAt > Date.now() - 10000)
      })
    })
  })
})

function createSomeBuffers (window, callback) {
  (function next (i) {
    if (data.length <= i) return callback()
    buffers.create(window, data[i], error => {
      if (error) return callback(error)
      setTimeout(next, 100, i+1)
    })
  }(0))
}
