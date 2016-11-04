const test = require("prova")
const downloads = require("../lib/downloads")

test('downloading a url', function (t) {
  const flush = downloads.test()

  t.plan(4)

  downloads.download('http://azer.bike/me.jpg', (error, id) => {
    t.error(error)

    downloads.store.get(id, (error, row) => {
      t.error(error)
      t.equal(row.id, id)
      t.equal(row.type, 'image')
    })
  })
})
