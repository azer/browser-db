const test = require("prova")
const files = require("../lib/files")

test('saving & reading images', function (t) {
  const flush = files.test()

  t.plan(5)
  image((error, blob) => {
    t.error(error)

    files.set('foo', blob, error => {
      t.error(error)

      files.get('foo', (error, result) => {
        t.error(error)

        const url = URL.createObjectURL(result)
        document.body.innerHTML = `<img src=${url} />`

        const img = document.querySelector('img')
        img.onload = event => {
          t.equal(img.width, 284)
          t.equal(img.height, 286)
          flush()
        }
      })
    })
  })
})

test('delete', function (t) {
  const flush = files.test()
  t.plan(4)

  files.set('foo', new Blob(), error => {
    t.error(error)

    files.delete('foo', error => {
      t.error(error)

      files.get('foo', (error, row) => {
        t.error(error)
        t.notOk(row)
        flush()
      })
    })
  })
})


function image (callback) {
  var xhr = new XMLHttpRequest()
  xhr.open("GET", "/assets/in/test/dog.jpg")
  xhr.responseType = "blob"

  xhr.addEventListener('load', event => {
    if (xhr.status !== 200) return
    callback(undefined, xhr.response)
  })

  xhr.addEventListener('error', event => {
    callback(event.error)
  })

  xhr.send()
}
