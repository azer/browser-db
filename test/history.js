const test = require("prova")
const history = require("../lib/history")

const data = [
  { protocol: 'http://', url: 'yo.lo', counter: 3, lastVisitedAt: ago(5) },
  { protocol: 'http://', url: 'lonelyplanet.com', counter: 30, lastVisitedAt: ago(9) },
  { protocol: 'http://', url: 'wikipedia.org', counter: 5, lastVisitedAt: ago(1) },
  { protocol: 'http://', url: 'localhost', counter: 100, lastVisitedAt: ago(17) },
  { protocol: 'http://', url: 'localhost/foo', counter: 40, lastVisitedAt: ago(20) },
  { protocol: 'http://', url: 'localhost/bar', counter: 30, lastVisitedAt: ago(19) },
  { protocol: 'http://', url: 'localhost/qux', counter: 60, lastVisitedAt: ago(18) },
  { protocol: 'http://', url: 'azer.bike', counter: 2, lastVisitedAt: ago(0) },
  { protocol: 'http://', url: 'pmr.lt', counter: 10, lastVisitedAt: ago(2) },
]

test('visiting a url', function (t) {
  const flush = history.test()
  t.plan(6)

  history.visit('https://yo.lo/', (error, id) => {
    t.error(error)
    t.equal(id, 'yo.lo');

    history.get(id, (error, row) => {
      t.error(error)
      t.equal(row.url, 'yo.lo');
      t.ok(row.lastVisitedAt > Date.now() - 10000)
      t.equal(row.counter, 1)

      flush()
    })
  })
})

test('updating at each visit', function (t) {
  const flush = history.test()

  t.plan(7)

  history.visit('https://yo.lo/', error => {
    t.error(error)

    history.get('https://yo.lo', (error, firstVisit) => {
      t.error(error)

      history.visit('yo.lo', error => {
        t.error(error)

        history.get('https://yo.lo', (error, secondVisit) => {
          t.error(error)
          t.equal(firstVisit.url, secondVisit.url)
          t.equal(firstVisit.counter + 1, secondVisit.counter)
          t.ok(firstVisit.lastVisitedAt < secondVisit.lastVisitedAt)

          flush()
        })
      })
    })
  })
})

test('skips empty urls', function (t) {
  const flush = history.test()
  t.plan(2)

  history.visit('', (error, id) => {
    t.error(error)
    t.notOk(id)
    flush()
  })
})

test.skip('popular urls this week', function (t) {
  const flush = history.test()

  const expected = ['pmr.lt', 'wikipedia.org', 'yo.lo', 'azer.bike']

  populate(error => {
    t.error(error)

    let ctr = -1
    history.popularThisWeek((error, result) => {
      t.error(error)
      if (!result) {
        flush()
        return t.end()
      }

      console.log(ctr, result.value.counter, result.value.url)
      t.equal(result.value.url, expected[++ctr]);
      result.continue()
    })
  })
})

test('popular urls all time', function (t) {
  const flush = history.test()

  const expected = ['localhost', 'localhost/qux', 'localhost/foo', 'lonelyplanet.com', 'localhost/bar', 'pmr.lt', 'wikipedia.org', 'yo.lo', 'azer.bike']

  populate(error => {
    t.error(error)

    let ctr = -1
    history.popular((error, result) => {
      t.error(error)
      if (!result) {
        flush()
        return t.end()
      }

      t.equal(result.value.url, expected[++ctr]);
      result.continue()
    })
  })
})

function populate (callback) {
  (function next (i) {
    if (i >= data.length) return callback()

    history.store.add(data[i], error => {
      if (error) return callback(error)
      next(i+1)
    })
  }(0))
}

function ago (day) {
  return Date.now() - (86400000 * day)
}
