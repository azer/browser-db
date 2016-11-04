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
  const windowId = 1

  t.plan(7)

  buffers.create(windowId, '', (error, id) => {
    t.error(error)

    buffers.get(id, (error, row) => {
      t.error(error);
      t.ok(row)
      t.equal(row.url, '')
      t.equal(row.selected, 0)
      t.equal(row.window, windowId)
      t.ok(row.createdAt > Date.now() - 10000)
      flush()
    })
  })
})

test('listing all buffers', function (t) {
  const flush = buffers.test()
  t.plan(26)

  const expected = [
    '', 'foo.com', 'bar.com', 'qux.com'
  ]

  createSomeBuffers(314, error => {
    t.error(error)

    let ctr = -1;
    buffers.all(314, (error, result) => {
      t.error(error)
      if (!result) return flush()

      t.ok(ctr < 4)
      t.equal(result.value.url, expected[++ctr]);
      t.equal(result.value.selected, 0);
      t.equal(result.value.window, 314)
      t.ok(result.value.createdAt > Date.now() - 10000)
      result.continue()
    })
  })
})

test('set as selected', function (t) {
  const flush = buffers.test()
  const windowId = 222
  t.plan(6)

  createSomeBuffers(windowId, error => {
    t.error(error)

    buffers.setAsSelected(windowId, 3, error => {
      t.error(error)

      buffers.getSelected(windowId, (error, row) => {
        t.error(error)
        t.equal(row.id, 3)
        t.equal(row.window, 222)
        t.equal(row.selected, 1);
      })
    })
  })
})

test('set as unselected', function (t) {
  const flush = buffers.test()
  const windowId = 333
  t.plan(8)

  createSomeBuffers(windowId, error => {
    t.error(error)

    buffers.setAsSelected(windowId, 3, error => {
      t.error(error)

      buffers.setAsUnselected(windowId, 3, error => {
        t.error(error)

        buffers.get(3, (error, row) => {
          t.error(error)
          t.equal(row.id, 3)
          t.equal(row.selected, 0)
        })

        buffers.getSelected(windowId, (error, row) => {
          t.error(error)
          t.notOk(row)
        })
      })
    })
  })
})

function createSomeBuffers (window, callback) {
  (function next (i) {
    if (data.length <= i) return callback()
    buffers.create(window, data[i], error => {
      if (error) return callback(error)
      next(i+1)
    })
  }(0))
}
