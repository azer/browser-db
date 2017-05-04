module.exports = createIfEmpty;

function createIfEmpty (select, create) {
  return function (window, callback) {
    let hasRows = false
    select(window, (error, row) => {
      if (error) return callback(error)

      if (row || hasRows) {
        hasRows || (hasRows = true)
        return callback(undefined, row)
      }

      create(window, error => {
        if (error) return callback(error)
        select(window, callback)
      })
    })

    /*
    ugly but robust impl without hardcoding

    const callback = arguments[arguments.length - 1]
    const customArgs = Array.prototype.slice.call(arguments, 0, -1)
    const origArgs = arguments
    let hasRows = false

    customArgs.push((error, row) => {
      if (error) return callback(error)
      if (row || hasRows) {
        hasRows || (hasRows = true)
        return callback(undefined, row)
      }

      create.apply(undefined, customArgs.slice(0, -1).concat([error => {
        if (error) return callback(error)
        select.apply(undefined, origArgs)
      }]))
    })

    select.apply(undefined, customArgs)*/
  }
}
