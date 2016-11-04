const mimeOf = require("mime-of")
const urls = require("urls")
const db = require("./db")

let store = db.store('downloads', {
  indexes: [
    'type',
    'downloadedAt'
  ]
})

module.exports = {
  store,
  all,
  download,
  test
}

function all (callback) {
  store.select('downloadedAt', null, 'prev', callback)
}

function download (url, callback) {
  const props = {
    protocol: urls.protocol(url),
    url: urls.clean(url),
    downloadedAt: Date.now(),
    type: mimeOf(url).split('/')[0] || ''
  }

  store.add(props, callback)
}

function test () {
  store = module.exports.store = store.testing()
  return () => store.db.delete()
}
