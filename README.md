## db

Database library of Kaktus. It consists of following IndexedDB storages;

* [Buffers](#buffers)
* [Positions](#positions)
* [History](#history)
* [Likes](#likes)
* [Domains](#domains)
* [Meta](#meta)
* [Keywords](#keywords)
* [Downloads](#downloads)
* [Screenshots](#screenshots)
* [Icons](#icons)
* [Files](#files)

Here is some quick bulletpoints about how this DB interacts with Kaktus:

* Kaktus window manager gives each window an ID, passes it to the window.
* Window displays are represented as one or multiple positions. Each position shows one buffer.
* When user opens the browser for first time, Kaktus creates the default position (single-full) with an empty buffer (displayed as new tab UI)
* When user types a URL to go, current focused position's buffer updates its URL attribute. Every URL visited will be saved to history.
* Once a page is loaded, Kaktus will extract meta and keywords from the page and save it to the DB.

## Install

```bash
$ npm install kaktus/db
```

## First Steps

A web browsing session starts with showing the buffer(s) of the current session. Here is how we program that;

```js
const db = require('db')

// Grab all the positions
db.positions.all((error, row) => {
  if (error) throw error

  row.value.width
  // => 100%

  row.value.height
  // => 100%

  db.buffers.get(row.value, (error, buffer) => {
    if (error) throw error

    buffer.url
    // => lonelyplanet.com
  })
})
```

See [API Reference](#API) or the `test/` folder for more documentation.

## API

### Buffers

URLs user viewing (a.k.a tabs)

**Methods:**
* all
* create
* find
* get
* kill
* setURL

### Positions

Every buffer is displayed via a position that stores its geometrical info. Using this, we can show multiple buffers in one display easily.

**Methods:**
* all
* create
* focus
* getFocused
* setBuffer
* setAsFocused
* setAsNotFocused
* setPosition
* kill

### Domains

Domain information & settings

**Methods:**
* get
* set
* setPrivateMode

### Downloads

All downloads made

**Methods:**
* all
* download

### Files

Blob file database. It's used by other storages like [screenshots](#screenshots) and [icons](#icons).

**Methods:**
* get
* set
* delete: del

### History

All URLs visited

* all
* get
* popular
* popularThisWeek
* visit

### Icons

LRU[250] storage for website icons

* add
* get

### Keywords

Every keyword extracted has its own row pointing to a URL. Storing keywords lets Kaktüs search history, likes and downloads.

**Methods:**
* get
* set
* search
* markAsLiked
* markAsNotLiked
* markAsDownloaded
* markAsNotDownloaded

### Likes

Liked URLs

**Methods:**
* all
* get
* like
* unlike

### Meta

Meta information of all URLs visited (title, icon, etc)

**Methods:**
* draft
* get
* set

### Screenshots

LRU[10] storage for screenshots

* add
* get
