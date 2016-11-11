const urls = require("urls")
const createIfEmpty = require("./create-if-empty")

const db = require("./db")

let store = db.store('buffers', {
  indexes: [
    { name: 'window+url', fields: ['window', 'url'] },
    { name: 'window+lastSeenAt', fields: ['window', 'lastSeenAt'] }
  ]
})

module.exports = {
  store,
  all: createIfEmpty(all, createDefault),
  create,
  createDefault,
  find,
  get,
  kill,
  setURL,
  onUnselect,
  test
}

function all (window, callback) {
  store.select('window+lastSeenAt', { from: [window, 0], to: [window, Date.now()] }, 'prev', callback)
}

function create (window, url, callback) {
  store.add({ url: urls.clean(url), window, lastSeenAt: Date.now(), createdAt: Date.now() }, callback)
}

function createDefault (window, callback) {
  create(window, '', callback)
}

function find (window, url, callback) {
  store.getByIndex('window+url', [window, urls.clean(url)], callback)
}

function get (id, callback) {
  store.get(id, callback)
}

function kill (id, callback) {
  store.delete(id, callback)
}

function setURL (id, url, callback) {
  store.get(id, (error, row) => {
    if (error) return callback(error)

    row.url = urls.clean(url)
    store.update(row, callback)
  })
}

function onUnselect (id, callback) {
  store.get(id, (error, buffer) => {
    if (error) return callback(error)

    if (!buffer) return callback()

    buffer.lastSeenAt = Date.now()
    store.update(buffer, callback)
  })
}

function test () {
  store = module.exports.store = store.testing()
  return () => store.db.delete()
}
