const urls = require("urls")
const db = require("./db")
const files = require("./files")

const LRU_LIMIT = 100

let store = db.store('icons', {
  indexes: [
    'url'
  ]
})

module.exports = {
  store,
  add,
  get,
  test
}

function add (ourl, image, callback) {
  const url = urls.page(ourl)

  store.add({ url }, (error, id) => {
    if (error) return callback(error)

    remove(id - LRU_LIMIT, error => {
      if (error) return callback(error)

      files.set(`icons:${url}`, image, error => {
        if (error) return callback(error)

        callback(undefined, id)
      })
    })
  })
}

function get (ourl, callback) {
  const url = urls.page(ourl)

  store.getByIndex('url', url, (error, row) => {
    if (error) return callback(error)
    if (!row) return callback()

    files.get(`icons:${url}`, (error, blob) => {
      if (error) return callback(error)
      if (!blob) return callback(new Error('Can not find screenshot for ' + url))

      row.blob = blob
      callback(undefined, row)
    })
  })
}

function remove (id, callback) {
  if (id < 1) return callback()

  store.get(id, (error, row) => {
    if (error) return callback(error)

    files.delete(`icons:${row.url}`, error => {
      if (error) return callback(error)

      store.delete(id, callback)
    })
  })
}

function test () {
  store = module.exports.store = store.testing()
  const flushFiles = files.test(store.db)

  return () => {
    store.db.delete()
    flushFiles()
  }
}
