const test = require("prova")
const keywords = require("../lib/keywords")

const sample = [
  ['travel', 'lonelyplanet.com', ago(30)],

  ['travel', 'lonelyplanet.com/morocco', ago(1), 0, 0],
  ['morocco', 'lonelyplanet.com/morocco', ago(1), 0, 0],

  ['wikipedia', 'en.wikipedia.org/morocco', ago(5), 0, 0],
  ['morocco', 'en.wikipedia.org/morocco', ago(5), 0, 0],

  ['wikipedia', 'en.wikipedia.org/music', ago(7), 1, 0],
  ['music', 'en.wikipedia.org/music', ago(7), 1, 0],

  ['music', 'listenparadise.org', ago(3), 1, 1],
  ['radio', 'listenparadise.org', ago(3), 1, 1],
  ['paradise', 'listenparadise.org', ago(3), 1, 1],

  ['pmr', 'pmr.lt', ago(10), 0, 1],
  ['radio', 'pmr.lt', ago(10), 0, 1],
  ['music', 'pmr.lt', ago(10), 0, 1],

  ['moroccan', 'en.wikipedia.org/moroccan_music', ago(20), 1, 0],
  ['musiki', 'en.wikipedia.org/moroccan_music', ago(20), 1, 0]
]

test('get & set', function (t) {
  const flush = keywords.test()
  t.plan(15)

  keywords.set({ url: 'yolo.com/foo?#span', keywords: ['yolo', 'life'] }, error => {
    t.error(error)

    keywords.set({ url: 'yolo.com/foo?#eggs', keywords: ['philosophy', 'life'] }, error => {
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

test('search: filtering liked urls', function (t) {
  const flush = keywords.test()
  t.plan(3)

  populate(error => {
    t.error(error)

    const input = ['music']
    const expected = ['listenparadise.org', 'en.wikipedia.org/music']
    let ctr = -1

    keywords.search(input, { liked: true }, (error, urls) => {
      t.error(error)
      t.deepEqual(urls, expected)
    })
  })
})

test('marking a url as liked', function (t) {
  const flush = keywords.test()
  t.plan(19)

  keywords.set({ url: 'yolo.com/foo?#span', keywords: ['yolo', 'life', 'philosophy'] }, error => {
    t.error(error)

    keywords.markAsLiked('yolo.com/foo', error => {
      t.error(error)

      const expected = ['yolo', 'life', 'philosophy']
      let ctr = -1
      keywords.get('yolo.com/foo', (error, row) => {
        t.error(error)
        if (!row) {
          t.equal(ctr, 2)
          return flush()
        }

        t.ok(++ctr <= 3)
        t.equal(row.value.keyword, expected[ctr])
        t.equal(row.value.url, 'yolo.com/foo')
        t.equal(row.value.liked, 1)
        row.continue()
      })
    })
  })
})

test('marking a url as not liked', function (t) {
  const flush = keywords.test()
  t.plan(20)

  keywords.set({ url: 'yolo.com/foo?#span', keywords: ['yolo', 'life', 'philosophy'] }, error => {
    t.error(error)

    keywords.markAsLiked('yolo.com/foo', error => {
      t.error(error)

      keywords.markAsNotLiked('yolo.com/foo', error => {
        t.error(error)

        const expected = ['yolo', 'life', 'philosophy']
        let ctr = -1
        keywords.get('yolo.com/foo', (error, row) => {
          t.error(error)
          if (!row) {
            t.equal(ctr, 2)
            return flush()
          }

          t.ok(++ctr <= 3)
          t.equal(row.value.keyword, expected[ctr])
          t.equal(row.value.url, 'yolo.com/foo')
          t.equal(row.value.liked, 0)
          row.continue()
        })
      })
    })
  })
})

test('marking a url as downloaded', function (t) {
  const flush = keywords.test()
  t.plan(19)

  keywords.set({ url: 'yolo.com/foo?#span', keywords: ['yolo', 'life', 'philosophy'] }, error => {
    t.error(error)

    keywords.markAsDownloaded('yolo.com/foo', error => {
      t.error(error)

      const expected = ['yolo', 'life', 'philosophy']
      let ctr = -1
      keywords.get('yolo.com/foo', (error, row) => {
        t.error(error)
        if (!row) {
          t.equal(ctr, 2)
          return flush()
        }

        t.ok(++ctr <= 3)
        t.equal(row.value.keyword, expected[ctr])
        t.equal(row.value.url, 'yolo.com/foo')
        t.equal(row.value.downloaded, 1)
        row.continue()
      })
    })
  })
})

test('marking a url as not downloaded', function (t) {
  const flush = keywords.test()
  t.plan(20)

  keywords.set({ url: 'yolo.com/foo?#span', keywords: ['yolo', 'life', 'philosophy'] }, error => {
    t.error(error)

    keywords.markAsDownloaded('yolo.com/foo', error => {
      t.error(error)

      keywords.markAsNotDownloaded('yolo.com/foo', error => {
        t.error(error)

        const expected = ['yolo', 'life', 'philosophy']
        let ctr = -1
        keywords.get('yolo.com/foo', (error, row) => {
          t.error(error)
          if (!row) {
            t.equal(ctr, 2)
            return flush()
          }

          t.ok(++ctr <= 3)
          t.equal(row.value.keyword, expected[ctr])
          t.equal(row.value.url, 'yolo.com/foo')
          t.equal(row.value.downloaded, 0)
          row.continue()
        })
      })
    })
  })
})

function populate (callback) {
  (function next (i) {
    if (i >= sample.length) return callback()
    keywords.store.add({ keyword: sample[i][0], url: sample[i][1], lastUpdatedAt: sample[i][2], liked: sample[i][3], downloaded: sample[i][4] }, error => {
      if (error) return callback(error)
      next(i+1)
    })
  }(0))
}

function ago (day) {
  return Date.now() - (86400000 * day)
}
