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
    { name: 'keyword+lastUpdatedAt', fields: ['keyword', 'lastUpdatedAt'] },
    { name: 'liked+keyword+lastUpdatedAt', fields: ['liked', 'keyword', 'lastUpdatedAt'] },
    { name: 'downloaded+keyword+lastUpdatedAt', fields: ['downloaded', 'keyword', 'lastUpdatedAt'] }
  ]
})

module.exports = {
  store,
  get,
  set,
  search,
  markAsLiked: mark('liked', 1),
  markAsNotLiked: mark('liked', 0),
  markAsDownloaded: mark('downloaded', 1),
  markAsNotDownloaded: mark('downloaded', 0),
  test
}

function get (url, callback) {
  store.select('url', urls.page(url), callback)
}

function mark (key, value) {
  return (url, callback) => {
    const rows = []

    get(url, (error, row) => {
      if (error) return callback(error)
      if (!row) return end()

      if (row.value[key] !== value) {
        row.value[key] = value
        rows.push(row.value)
      }

      row.continue()
    })

    function end () {
      Promise.all(rows.map(row => store.update(row)))
        .catch(callback)
        .then(() => callback())
    }
  }
}

function set (options, callback) {
  const url = urls.page(options.url)
  loop(options.keywords.length, each, callback)

  function each (done, index) {
    store.getByIndex('url+keyword', [url, options.keywords[index]], (error, row) => {
      if (error) return callback(error)
      if (row) {
        row.lastUpdatedAt = Date.now()
        return store.update(row, callback)
      }

      store.add({ keyword: options.keywords[index],
                  url: url,
                  lastUpdatedAt: Date.now(),
                  options: options.type
                }, done)
    })
  }
}

function search (keywords, filter, callback) {
  if (arguments.length === 2) {
    callback = filter
    filter = undefined
  }

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

    //store.select('keyword+lastUpdatedAt', { from: [keywords[i]], to: [keywords[i] + '\uffff'] }, 'prev', (error, row) => {
    select(keywords[i], (error, row) => {
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

  function select (keyword, callback) {
    if (!filter) {
      return store.select('keyword+lastUpdatedAt', { from: [keyword], to: [keyword + '\uffff'] }, 'prev', callback)
    }

    store.select('liked+keyword+lastUpdatedAt', { from: [1, keyword], to: [1, keyword + '\uffff'] }, 'prev', callback)
  }
}

function test () {
  store = module.exports.store = store.testing()
  return () => store.db.delete()
}
