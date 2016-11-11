const db = require("./db")
const buffers = require("./buffers")
const createIfEmpty = require("./create-if-empty")

let store = db.store('positions', {
  indexes: [
    'window',
    { name: 'window+buffer', fields: ['window', 'buffer'] },
    { name: 'window+focused', fields: ['window', 'focused'] }
  ]
})

module.exports = {
  store,
  all: createIfEmpty(all, createDefault),
  create,
  createDefault,
  focus,
  get,
  getFocused,
  killBuffer,
  setBuffer,
  setAsFocused,
  setAsNotFocused,
  setPosition,
  kill,
  test
}

function all (window, callback) {
  store.select('window', window, callback)
}

function createDefault (window, callback) {
  recentUnselectedBuffer(window, (error, buffer) => {
    if (error) return callback(error)
    create(window, { buffer, focused: 1 }, callback)
  })
}

function create (window, options, callback) {
  store.add({
    window,
    "buffer": options.buffer,
    "focused": options.focused || 0,
    "width": options.width || '100%',
    "height": options.height || '100%',
    "top": options.top || 0,
    "left": options.left || 0,
    "right": options.right || 0,
    "bottom": options.bottom || 0
  }, callback)
}

function focus (window, id, callback) {
  getFocused(window, (error, selected) => {
    if (error) return callback(error)
    if (!selected) return setAsFocused(id, callback)

    setAsNotFocused(selected.id, error => {
      if (error) return callback(error)

      setAsFocused(id, callback)
    })
  })
}

function get (id, callback) {
  store.get(id, callback)
}

function getFocused (window, callback) {
  store.getByIndex('window+focused', [window, 1], callback)
}

function isBufferDisplayed (window, buffer, callback) {
  store.select('window+buffer', [window, buffer], (error, result) => {
    if (error) return callback(error)
    callback(undefined, !!result)
  })
}


function kill (id, callback) {
  store.delete(id, callback)
}

function killBuffer (window, pid, bid, callback) {
  buffers.kill(bid, error => {
    if (error) return callback(error)

    recentUnselectedBuffer(window, (error, buffer) => {
      if (error) return callback(error)

      setBuffer(pid, buffer, callback)
    })
  })
}

// Returns id of a recently unselected buffer.
function recentUnselectedBuffer (window, callback) {
  const allbuffers = []

  buffers.all(window, (error, row) => {
    if (error) return callback(error)
    if (row) {
      allbuffers.push(row.value.id)
      return row.continue()
    }

    (function next (i) {
      if (i >= allbuffers.length) {
        return buffers.createDefault(window, callback)
      }

      isBufferDisplayed(window, allbuffers[i], (error, result) => {
        if (error) return callback(error)
        if (!result) return callback(undefined, allbuffers[i])
        next(i + 1)
      })
    }(0))
  })
}

function setBuffer (pid, bid, callback) {
  store.get(pid, (error, position) => {
    if (error) return callback(error)
    if (!position) return callback(new Error(`Position ${pid} does not exist`))
    if (position.buffer === bid) return callback()

    buffers.onUnselect(position.buffer, error => {
      if (error) return callback(error)

      position.buffer = bid
      store.update(position, callback)
    })
  })
}

function setAsFocused (id, callback) {
  store.get(id,  (error, row) => {
    if (error) return callback(error)

    row.focused = 1
    store.update(row, callback)
  })
}

function setAsNotFocused (id, callback) {
  store.get(id,  (error, row) => {
    if (error) return callback(error)

    row.focused = 0
    store.update(row, callback)
  })
}

function setPosition (id, options, callback) {
  store.get(id,  (error, row) => {
    if (error) return callback(error)

    row.width = options.width
    row.height = options.height
    row.top = options.top
    row.bottom = options.bottom
    row.left = options.left
    row.right = options.right

    store.update(row, callback)
  })
}

function test () {
  const flushBuffers = buffers.test()
  store = module.exports.store = store.testing()

  return () => {
    store.db.delete()
    flushBuffers()
  }
}
