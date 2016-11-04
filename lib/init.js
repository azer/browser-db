const loop = require("parallel-loop")
const urls = require("./urls")
const buffers = require("./buffers")

const recommended = require("../recommended")

module.exports = init;

function init (callback) {
  buffers.create((error, id) => {
    if (error) return callback(error)
  })
}

function addRecommendedSites (callback) {
  loop(recommended.length, each, callback)

  function each (done, index) {
    /*recommended[index].isPopularRecord = true

    urls.save({
      protocol: urls.protocol(recommended[index].url),
      url: urls.clean(recommended[index].url),
      lastUpdatedAt: Date.now() - (index * 1000),
      counter: 5,
      isPopularRecord: true
    }, error => {
      if (error) return done(error)
      urls.save(recommended[index], done)
    })*/
  }
}
