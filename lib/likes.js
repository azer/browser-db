const urls = require("urls")
const db = require("./db")

let store = db.store('likes', {
  key: 'url',
  indexes: [
    'likedAt'
  ]
})

module.exports = {
  store,
  all,
  like,
  unlike,
  get,
  test
};

function like (url, callback) {
  get(url, (error, row) => {
    if (error || row) return callback(error)
    store.add({ url: urls.clean(url), likedAt: Date.now() }, callback)
  })
}

function unlike (url, callback) {
  store.delete(urls.clean(url), callback)
}

function get (url, callback) {
  store.get(urls.clean(url), callback)
}

function all (callback) {
  store.select('likedAt', null, 'prev', callback)
}

function test () {
  store = module.exports.store = store.testing()
  return () => store.db.delete()
}
