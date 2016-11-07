const urls = require("urls")
const db = require("./db")

let store = db.store('buffers', {
  indexes: [
    'window',
    'selected',
    'url',
    { name: 'window+url', fields: ['window', 'url'] },
    { name: 'window+selected', fields: ['window', 'selected'] }
  ]
})

module.exports = {
  store,
  all,
  create,
  find,
  get: get,
  getSelected,
  kill,
  select,
  setAsSelected,
  setAsUnselected,
  setURL,
  test
}

function all (window, callback) {
  store.select('window', window, callback)
}

function create (window, url, callback) {
  store.add({ url: urls.clean(url), window, selected: 0, createdAt: Date.now() }, (error, bufferId) => {
    if (error) return callback(error)

    select(window, bufferId, callback)
  })
}

function find (window, url, callback) {
  store.getByIndex('window+url', [window, urls.clean(url)], callback)
}

function get (id, callback) {
  store.get(id, callback)
}

function kill (id, callback) {
  store.get(id, (error, buffer) => {
    if (error) return callback(error)

    store.delete(id, callback)
  })
}

function select (window, id, callback) {
  getSelected(window, (error, selected) => {
    if (error) return callback(error)
    if (!selected) return setAsSelected(id, callback)

    setAsUnselected(selected.id, error => {
      if (error) return callback(error)

      setAsSelected(id, callback)
    })
  })
}

function setAsSelected (id, callback) {
  store.get(id, (error, row) => {
    if (error) return callback(error)

    row.selected = 1
    row.lastSeenAt = Date.now()

    store.update(row, callback)
  })
}

function setAsUnselected (id, callback) {
  store.get(id, (error, row) => {
    if (error) return callback(error)

    row.selected = 0
    row.lastSeenAt = Date.now()

    store.update(row, callback)
  })
}

function getSelected (window, callback) {
  store.getByIndex('window+selected', [window, 1], callback)
}

function setURL (id, url, callback) {
  store.get(id, (error, row) => {
    if (error) return callback(error)

    row.url = urls.clean(url)
    store.update(row, callback)
  })
}

function test () {
  store = module.exports.store = store.testing()
  return () => store.db.delete()
}
