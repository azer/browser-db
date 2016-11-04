const indexeddb = require("indexeddb")
const version = 1

module.exports = indexeddb('kaktus', { version })
module.exports.testing = testing

function testing () {
  module.exports = indexeddb.createTestingDB()
}
