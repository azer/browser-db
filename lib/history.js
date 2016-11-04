const urls = require("urls")
const db = require("./db")

const ONE_WEEK = 604800000

let store = db.store('history', {
  key: 'url',
  indexes: [
    'counter',
    'lastVisitedAt',
    { name: 'lastVisitedAt+counter', fields: ['lastVisitedAt', 'counter'] },
    { name: 'counter+lastVisitedAt', fields: ['counter', 'lastVisitedAt'] }
  ]
})

module.exports = {
  store,
  all,
  get,
  popular,
  popularThisWeek,
  visit,
  test
}

function all (callback) {
  store.select('lastVisitedAt', null, 'prev', callback)
}

function get (url, callback) {
  store.get(urls.clean(url), callback)
}

// fixme: this is not working, see the related tests failing
function popularThisWeek (callback) {
  //store.select('counter+lastVisitedAt', { from: [0, Date.now() - ONE_WEEK] }, 'prev', callback)
  store.select('lastVisitedAt+counter', { from: [Date.now() - ONE_WEEK], to: [Date.now()] }, 'prev', callback)
}

function popular (callback) {
  store.select('counter', null, 'prev', callback)
}

function visit (url, callback) {
  const props = {
    protocol: urls.protocol(url),
    url: urls.clean(url),
    lastVisitedAt: Date.now(),
    counter: 1
  }

  store.get(props.url, function (error, existing) {
    if (error) return callback(error)
    if (!existing) {
      return store.add(props, callback)
    }

    props.counter = (existing.counter || 0) + 1
    store.update(props, error => {
      if (error) return callback(error)
      callback(undefined, existing.id)
    })
  })
}

function test () {
  store = module.exports.store = store.testing()
  return () => store.db.delete()
}
