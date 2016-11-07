## db

Database library of Kaktus. It consists of 5 IndexedDB storages;

* **Buffers:** URLs user viewing (a.k.a tabs)
* **History:** All URLs visited
* **Likes:** Liked URLs
* **Domains:** Domain information & settings
* **Meta:** Meta information of URLs (title, icon, etc)
* **Keywords:** Every keyword extracted has its own row pointing to a URL
* **Downloads:** All downloads made
* **Screenshots:** LRU[10] storage for screenshots
* **Icons:** LRU[250] storage for favicons
* **Files:** Blob file database

## Install

```bash
$ npm install kaktus/db
```

## Manual

See the `test/` folder for documentation & usage examples.
