const urls = require("urls")
const titleFromURL = require("title-from-url")
const db = require("./db")

let store = db.store('meta', {
  key: 'url'
})

module.exports = {
  store,
  draft,
  get,
  set,
  test
}

function get (url, callback) {
  store.get(urls.page(url), (error, row) => {
    if (error) return callback(error)
    if (!row) return callback(undefined, draft(url, {}))
    return callback(undefined, row)
  })
}

function set (url, props, callback) {
  get(url, (error, existing) => {
    if(error) return callback(error)
    if (!existing) {
      return store.add(draft(url, props), callback)
    }

    store.update(mix(url, props, existing), callback)
  })
}

function draft (url, props) {
  return {
    url: urls.page(url),
    title: props.title || (url ? titleFromURL(url) : 'New Tab'),
    description: props.description || '',
    lastUpdatedAt: Date.now()
  }
}

function mix (url, source, fallback) {
  return {
    url: fallback.url,
    title: source.title || fallback.title,
    description: source.description || fallback.description,
    lastUpdatedAt: Date.now()
  }
}

function test () {
  store = module.exports.store = store.testing()
  return () => store.db.delete()
}
