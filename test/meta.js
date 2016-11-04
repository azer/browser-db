const test = require("prova")
const meta = require("../lib/meta")

test('get & set', function (t) {
  const flush = meta.test()
  t.plan(10)

  meta.set('http://foo.com/yolo?a=b#bar-qux', { title: 'a', description: 'b' }, error => {
    t.error(error)

    meta.get('foo.com/yolo?a=b#span', (error, row) => {
      t.error(error)
      t.equal(row.url, 'foo.com/yolo?a=b')
      t.equal(row.title, 'a')
      t.equal(row.description, 'b')
      t.ok(row.lastUpdatedAt > Date.now() - 10000)

      meta.set('foo.com/yolo?a=b&', { description: 'yo' }, error => {
        t.error(error)

        meta.get('foo.com/yolo?a=b', (error, updated) => {
          t.error(error)
          t.equal(updated.title, 'a')
          t.equal(updated.description, 'yo')

          flush()
        })
      })
    })
  })
})

test('return an empty draft if meta was never saved', function (t) {
  const flush = meta.test()

  t.plan(5)

  meta.get('foo.com/yolo', (error, row) => {
    t.error(error)
    t.equal(row.url, 'foo.com/yolo')
    t.equal(row.title, 'Yolo on Foo')
    t.equal(row.description, '')
    t.ok(row.lastUpdatedAt > Date.now() - 10000)

    flush()
  })
})
