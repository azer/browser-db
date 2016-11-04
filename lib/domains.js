const urls = require("urls")
const db = require("./db")

let store = db.store('domains', {
  key: 'domain'
})

module.exports = {
  store,
  get,
  set,
  setPrivateMode,
  test
}

function get (url, callback) {
  store.get(urls.hostname(url), callback)
}

function setPrivateMode (url, value, callback) {
  set(url, { privateMode: value ? 1 : 0 }, callback)
}

function set (url, settings, callback) {
  const domain = urls.hostname(url)

  store.get(domain, (error, existing) => {
    if(error) return callback(error)
    if (!existing) {
      settings.domain = domain
      return store.add(settings, callback)
    }

    for (let key of settings) {
      existing[key] = settings[key]
    }

    store.update(existing, callback)
  })
}


function test () {
  store = module.exports.store = store.testing()
  return () => store.db.delete()
}
