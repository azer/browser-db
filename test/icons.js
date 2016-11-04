const test = require("prova")
const icons = require("../lib/icons")

test('saving & getting blobs', function (t) {
  const flush = icons.test()
  t.plan(5)

  icons.add('http://foo.com/#bar', new Blob(), (error, id) => {
    t.error(error)
    t.ok(id)

    icons.get('foo.com', (error, row) => {
      t.error(error)
      t.equal(row.id, id)
      t.ok(row.blob)
      flush()
    })
  })
})
