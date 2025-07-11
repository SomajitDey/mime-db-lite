// Brief: Access the database at https://github.com/SomajitDey/mime-db-cdn/tree/database
// Note: Must be runtime agnostic, i.e. should work in browsers, Node.js and server-less V8.
// Dynamic imports:
//  ./utils/lru-cache.min.js; See ./scripts/build.sh on how it is produced.

export default class DB {
  // Release/version of mime-db-cdn from which data is fetched
  // Must be same as in "devDependencies" of ./package.json
  static mimeDbCdnVersion = '4.0.0-1.54.0';
  static cdnBase = `https://cdn.jsdelivr.net/npm/mime-db-cdn@${DB.mimeDbCdnVersion}`;

  cache; // Holds the LRU-Cache if any. Kept public to inspect during testing/debugging.
  #cacheInit = {}; // Holds LRU-Cache init object

  // The default fetch method uses the runtime-native fetch()
  async fetch (...args) {
    return globalThis.fetch(...args);
  }

  constructor ({ fetch, cacheMaxEntries } = {}) {
    if (fetch) this.fetch = fetch;
    if (cacheMaxEntries) this.#cacheInit.max = cacheMaxEntries;
  }

  async #getCache () {
    if (this.cache === undefined && Object.keys(this.#cacheInit).length !== 0) {
      const { LRUCache } = await import('./utils/lru-cache.min.js');
      this.cache = new LRUCache(this.#cacheInit);
    }
    return this.cache;
  }

  // Params: <String>, MIME-type of the form <type>/<subtype>
  // Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types#structure_of_a_mime_type
  // Returns: <Object>, JSON value against the provided MIME-type key in mime-db
  // On error, rejects with message: 'Not Found'
  async query (mimeType) {
    const dbUrl = DB.cdnBase + `/mime-types/${mimeType}/data.json`;
    return this.fetch(dbUrl)
      .then((response) => {
        if (response.status === 404) throw new Error('Not Found');
        return response.json();
      });
  }

  // Params: <String>, MIME-type specification of format <type>/<subtype>[;<parameter>=<value>]
  // Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types#structure_of_a_mime_type
  // Returns: <Array>
  // On error, rejects with message: 'Not Found'
  async mimeToExtensions (mimeTypeSpec) {
    const [mimeType] = mimeTypeSpec.split(';'); // Removes trailing ;<parameter>=<value> if any
    const cache = await this.#getCache();
    let extensions = cache?.get(mimeType);
    if (extensions === undefined) {
      ({ extensions } = await this.query(mimeType));
      cache?.set(mimeType, extensions);
    }
    return extensions ?? [];
  }

  getExtensions = this.mimeToExtensions; // Alias

  // Params: <String>, path | filename with extension | extension with or without the leading dot
  // Returns: <Array>
  // On error, rejects with message: 'Not Found'
  async extensionToMimes (path) {
    const extension = path
      .split('/').pop() // Removed directory string
      .split('.').pop(); // Removed filename string
    // The above works even if `path` is just the extension, e.g. path = 'pdf' or path = '.pdf'
    const cache = await this.#getCache();
    let mimeTypes = cache?.get(extension);
    if (mimeTypes === undefined) {
      const dbUrl = DB.cdnBase + `/extensions/${extension}/data.json`;
      (
        { mimeTypes } = await this.fetch(dbUrl)
          .then((response) => {
            if (response.status === 404) throw new Error('Not Found');
            return response.json();
          })
      );
      cache?.set(extension, mimeTypes);
    }
    return mimeTypes ?? [];
  }

  getTypes = this.extensionToMimes; // Alias

  async extensionToMime (path) {
    const [mostImportantType, ...rest] = await this.getTypes(path);
    return mostImportantType;
  }

  getType = this.extensionToMime; // Alias
}
