const urls = require("urls")
const loop = require("parallel-loop")
const db = require("./db")

const MAX_SEARCH_LIMIT = 999

let store = db.store('keywords', {
  indexes: [
    'keyword',
    'url',
    'lastUpdatedAt',
    { name: 'url+keyword', fields: ['url', 'keyword'] },
    { name: 'keyword+lastUpdatedAt', fields: ['keyword', 'lastUpdatedAt'] }
  ]
})

module.exports = {
  store,
  get,
  set,
  search,
  test
}

function get (url, callback) {
  store.select('url', urls.page(url), callback)
}

function set (fullURL, keywords, callback) {
  const url = urls.page(fullURL)
  loop(keywords.length, each, callback)

  function each (done, index) {
    store.getByIndex('url+keyword', [url, keywords[index]], (error, row) => {
      if (error) return callback(error)
      if (row) {
        row.lastUpdatedAt = Date.now()
        return store.update(row, callback)
      }

      store.add({ keyword: keywords[index],
                  url: url,
                  lastUpdatedAt: Date.now()
                }, done)
    })
  }
}

function search (keywords, callback) {
  const scores = {}
  const urls = []

  loop(keywords.length, each, errors => {
    if (errors) return callback(errors[0])

    callback(undefined, urls.sort((a, b) => {
      if (scores[a] > scores[b]) {
        return -1
      }

      if (scores[a] < scores[b]) {
        return 1
      }

      return 0
    }))
  })

  function each (done, i) {
    let ctr = 0

    store.select('keyword+lastUpdatedAt', { from: [keywords[i]], to: [keywords[i] + '\uffff'] }, 'prev', (error, row) => {
      if (error) return done(error)
      if (!row || ++ctr >= MAX_SEARCH_LIMIT) return done()

      if (scores[row.value.url]) {
        scores[row.value.url] += row.value.lastUpdatedAt
      } else {
        scores[row.value.url] = row.value.lastUpdatedAt
        urls.push(row.value.url)
      }

      row.continue()
    })
  }
}

function test () {
  store = module.exports.store = store.testing()
  return () => store.db.delete()
}
