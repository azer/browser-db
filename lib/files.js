const db = require("./db")

let store = db.store('files')

module.exports = {
  store,
  get,
  set,
  delete: del,
  test
}

function get (key, callback) {
  store.get(key, callback)
}

function set (key, blob, callback) {
  store.readWrite((error, rw) => {
    if (error) return callback(error)

    const request = rw.add(blob, key)
    request.onsuccess = (event) => callback(undefined, event.target.result)
    request.onerror = event => callback(event.target.result)
  })
}

function del (id, callback) {
  store.delete(id, callback)
}

function test (db) {
  store = module.exports.store = store.testing(db)
  return () => store.db.delete()
}
