const test = require("prova")
const buffers = require("../lib/buffers")
const positions = require("../lib/positions")

const data = [
  'foo.com',
  'https://bar.com',
  'https://www.qux.com/'
]

test("create default position and empty buffer when there isn't any", function (t) {
  const window = 333 // just a random number is ok for testing
  const flush = positions.test()
  t.plan(9)

  positions.all(window, (error, row) => {
    t.error(error)

    if (!row) return flush()

    t.equal(row.value.id, 1)
    t.equal(row.value.buffer, 1)
    t.equal(row.value.focused, 1)
    t.equal(row.value.width, '100%')
    t.equal(row.value.height, '100%')
    t.equal(row.value.top, 0)
    t.equal(row.value.left, 0)
    row.continue()
  })
})

test('brings up the next buffer (or creates one) when you kill the current one', function (t) {
  const window = 333 // just a random number is ok for testing
  const flush = positions.test()
  t.plan(6)

  createSomeBuffers(window, error => {
    t.error(error)

    positions.all(window, (error, row) => {
      t.error(error)
      t.equal(row.value.buffer, 3)

      positions.killBuffer(window, row.value.id, row.value.buffer, error => {
        t.error(error)

        positions.get(row.value.id, (error, position) => {
          t.error(error)
          t.equal(position.buffer, 2)
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
      setTimeout(next, 100, i+1)
    })
  }(0))
}
