const test = require("prova")
const domains = require("../lib/domains")

test('setting private mode', function (t) {
  const flush = domains.test()
  t.plan(6)

  domains.get('foo.com/yo', (error, row) => {
    t.error(error)
    t.notOk(row)

    domains.setPrivateMode('http://foo.com/bar', true, error => {
      t.error(error)

      domains.get('http://foo.com/bar/qux', (error, row) => {
        t.error(error)
        t.equal(row.domain, 'foo.com')
        t.equal(row.privateMode, 1)

        domains.setPrivateMode('http://foo.com/bar', false, error => {
          t.error(error)
          t.equal(row.domain, 'foo.com')
          t.equal(row.privateMode, 0)
        })
      })
    })
  })
})
