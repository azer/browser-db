const test = require("prova")
const keywords = require("../lib/keywords")

const sample = [
  ['travel', 'lonelyplanet.com', ago(30)],

  ['travel', 'lonelyplanet.com/morocco', ago(1)],
  ['morocco', 'lonelyplanet.com/morocco', ago(1)],

  ['wikipedia', 'en.wikipedia.org/morocco', ago(5)],
  ['morocco', 'en.wikipedia.org/morocco', ago(5)],

  ['wikipedia', 'en.wikipedia.org/music', ago(7)],
  ['music', 'en.wikipedia.org/music', ago(7)],

  ['music', 'listenparadise.org', ago(3)],
  ['radio', 'listenparadise.org', ago(3)],
  ['paradise', 'listenparadise.org', ago(3)],

  ['pmr', 'pmr.lt', ago(10)],
  ['radio', 'pmr.lt', ago(10)],
  ['music', 'pmr.lt', ago(10)],

  ['moroccan', 'en.wikipedia.org/moroccan_music', ago(20)],
  ['musiki', 'en.wikipedia.org/moroccan_music', ago(20)]
]

test('get & set', function (t) {
  const flush = keywords.test()
  t.plan(15)

  keywords.set('yolo.com/foo?#span', ['yolo', 'life'], error => {
    t.error(error)

    keywords.set('yolo.com/foo?#eggs', ['philosophy', 'life'], error => {
      t.error(error)

      let ctr = -1
      const expected = ['yolo', 'life', 'philosophy']

      keywords.get('yolo.com/foo', (error, row) => {
        t.error(error)
        if (!row) return flush()

        t.ok(++ctr <= 3)
        t.equal(expected[ctr], row.value.keyword)
        t.equal('yolo.com/foo', row.value.url)

        row.continue()
      })
    })
  })
})

test('search: matching one full keyword', function (t) {
  const flush = keywords.test()
  t.plan(3)

  populate(error => {
    t.error(error)

    const input = ['music']
    const expected = ['listenparadise.org', 'en.wikipedia.org/music', 'pmr.lt']
    let ctr = -1
    keywords.search(input, (error, urls) => {
      t.error(error)
      t.deepEqual(urls, expected)
    })
  })
})

test('search: partially matching one keyword', function (t) {
  const flush = keywords.test()
  t.plan(3)

  populate(error => {
    t.error(error)

    const input = ['musi']
    const expected = ['listenparadise.org', 'en.wikipedia.org/music', 'pmr.lt', 'en.wikipedia.org/moroccan_music']
    let ctr = -1

    keywords.search(input, (error, urls) => {
      t.error(error)
      t.deepEqual(urls, expected)
    })
  })
})

test('search: matching multiple keywords', function (t) {
  const flush = keywords.test()
  t.plan(3)

  populate(error => {
    t.error(error)

    const input = ['rad', 'pmr', 'musi']
    const expected = ['pmr.lt', 'listenparadise.org', 'en.wikipedia.org/music', 'en.wikipedia.org/moroccan_music']
    let ctr = -1

    keywords.search(input, (error, urls) => {
      t.error(error)
      t.deepEqual(urls, expected)
    })
  })
})

function populate (callback) {
  (function next (i) {
    if (i >= sample.length) return callback()
    keywords.store.add({ keyword: sample[i][0], url: sample[i][1], lastUpdatedAt: sample[i][2] }, error => {
      if (error) return callback(error)
      next(i+1)
    })
  }(0))
}

function ago (day) {
  return Date.now() - (86400000 * day)
}
