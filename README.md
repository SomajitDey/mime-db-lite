# mime-db-lite
[![NPM Version](https://img.shields.io/npm/v/mime-db-lite)](https://www.npmjs.com/package/mime-db-lite)
[![Test](https://github.com/SomajitDey/mime-db-lite/actions/workflows/test.yaml/badge.svg)](https://github.com/SomajitDey/mime-db-lite/actions/workflows/test.yaml)
[![Publish NPM package](https://github.com/SomajitDey/mime-db-lite/actions/workflows/publish.yaml/badge.svg)](https://github.com/SomajitDey/mime-db-lite/actions/workflows/publish.yaml)

A tiny, lightweight, portable JavaScript API to query the complete [mime-db](https://github.com/jshttp/mime-db) (Media-type / MIME-type database).

Data is actually sourced from [mime-db-cdn](https://github.com/SomajitDey/mime-db-cdn), which mirrors [mime-db](https://github.com/jshttp/mime-db) with added features.

## Install and/or Import
For browsers:
```html
<script type="module">
    import DB from 'https://cdn.jsdelivr.net/npm/mime-db-lite@2.0.0/index.min.js';
    // Above, replace 2.0.0 with the actual version you'd be using, or use 'latest'
    
    // Your code here ...
</script>
```

For Node.js:

Install as
```bash
npm install mime-db-lite
```

Import as
```javascript
import DB from 'mime-db-lite';
```

## Instantiation, custom `fetch()` and LRU cache
Create an instance of the [imported DB class](#install-andor-import) to use the [fetch() API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) provided by the runtime and forgo caching.

👉 For browsers, the native `fetch()` will still use the [HTTP-cache](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching).
```javascript
const db = new DB();
```

To use an in-memory cache, instantiate as:
```javascript
const db = new DB({ cacheMaxEntries: <Integer> });
```
`<Integer>` denotes the maximum number of entries the cache can store, beyond which the [LRU](## "Least Recently Used") entries will be evicted to make just enough space.

👉 Using an LRU cache claims more run-time memory in return for faster lookups. For browsers this may be unnecessary, because browser-native `fetch()` already uses HTTP-cache by default.

To use a custom `fetch()` method, e.g. `async function custFetch (url) { ... }`, instantiate as:
```javascript
const db = new DB({ fetch: custFetch });
```

or, use an arrow function

```javascript
const db = new DB({
    fetch: async (url) => {
        // Your code here
    } 
});
```
## API
### `db.mimeToExtensions(mimeType)` or its alias `db.getExtensions(mimeType)`
Returns a promise that fulfills with an array of file-extensions.

`mimeType`

String representing a MIME-type with [structure](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types#structure_of_a_mime_type):
```
type/subtype

type/subtype;parameter=value
```

👉 The returned promise is rejected with `Not Found` error if the provided `mimeType` is unavailable in [mime-db](https://github.com/jshttp/mime-db).

Examples:
```javascript
console.log(await db.mimeToExtensions('application/mp4'));
// Prints [ 'mp4', 'mpg4', 'mp4s', 'm4p' ]

console.log(await db.getExtensions('application/javascript; charset=utf-8'));
// Prints [ 'js' ]
```

### `db.extensionToMimes(extension)` or its alias `db.getTypes(extension)`
Returns a promise that fulfills with an array of MIME-types. **Note that this array of MIME-types is sorted in descending order of importance** according to the same [logic](https://github.com/jshttp/mime-types/blob/v3.0.1/mimeScore.js) used by [mime-types](https://github.com/jshttp/mime-types). If only one MIME-type is required, simply choose the first element from the array, or use the `db.getType()` [method](#dbextensiontomimeextension-or-its-alias-dbgettypeextension).

`extension`

String representing either of
- path, e.g. `dir/subdir/file.ext`
- file-extension with or without the leading dot, e.g. `mp4`, `.mp4`
- file-name, e.g. `file.mp4`, `file.version.1.2.0.mp4`

👉 The returned promise is rejected with `Not Found` error if the provided `mimeType` is unavailable in [mime-db](https://github.com/jshttp/mime-db).

Examples:
```javascript
console.log(await db.extensionToMimes('dir/subdir/path.version.js'));

console.log(await db.getTypes('js'));

console.log(await db.getTypes('.js'));

// Prints [ 'application/javascript', 'text/javascript' ]
```

### `db.extensionToMime(extension)` or its alias `db.getType(extension)`
Same as `db.getTypes()` [above](#dbextensiontomimesextension-or-its-alias-dbgettypesextension) but the returned promise resolves with only a single MIME-type instead of an array. The returned MIME-type has the highest score according to the [logic](https://github.com/jshttp/mime-types/blob/v3.0.1/mimeScore.js) used by [mime-types](https://github.com/jshttp/mime-types).

Examples:
```javascript
console.log(await db.getType('.deb'));
// Prints 'application/x-debian-package'
```

### `db.query(mimeType)`
Returns a promise that fulfills with the [mime-db data object](https://github.com/jshttp/mime-db/tree/v1.54.0#data-structure) for the provided MIME-type.

`mimeType`

String representing a MIME-type in the [form](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types#structure_of_a_mime_type): `type/subtype`

👉 The returned promise is rejected with `Not Found` error if the provided `mimeType` is unavailable in [mime-db](https://github.com/jshttp/mime-db).

Examples:
```javascript
console.log(JSON.stringify(await db.query('application/javascript')));
// Prints '{"source":"apache","charset":"UTF-8","compressible":true,"extensions":["js"]}'
```

# Contribute
To register new media types in the database, [contribute directly to mime-db](https://github.com/jshttp/mime-db#contributing).

If you like this project, you can show your appreciation by
- [giving it a star](https://github.com/SomajitDey/mime-db-lite/stargazers) ⭐
-  sponsoring me through 👇

[![Sponsor](https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png)](https://buymeacoffee.com/SomajitDey)

Thank you 💚.
