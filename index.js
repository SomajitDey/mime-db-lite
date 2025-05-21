// Brief: Access the database at https://github.com/SomajitDey/mime-db-cdn/tree/database
// Note: Must be runtime agnostic, i.e. should work in browsers, Node.js and server-less V8.

// Params: <String>, MIME-type specification of format <type>/<subtype>[;<parameter>=<value>]
// Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types#structure_of_a_mime_type
// Returns: <Array>
// On error, rejects with message: 'Not Found'
export async function mimeToExtensions (mimeTypeSpec) {
  const [ mimeType ] = mimeTypeSpec.split(';'); // Removes trailing ;<parameter>=<value> if any
  const dbUrl = `https://cdn.jsdelivr.net/npm/mime-db-cdn@latest/mime-types/${mimeType}/data.json`;
  const { extensions } = await fetch(dbUrl)
  .then((response) => response.json())
  .catch((err) => {
    throw new Error('Not Found');
  });
  return extensions ?? [];
}

// Params: <String>, path | filename with extension | extension with or without the leading dot
// Returns: <Array>
// On error, rejects with message: 'Not Found'
export async function extensionToMimes (path) {
  const extension = path
    .split('/').pop() // Removed directory string
    .split('.').pop(); // Removed filename string
  // The above works even if `path` is just the extension, e.g. path = 'pdf' or path = '.pdf'
  const dbUrl = `https://cdn.jsdelivr.net/npm/mime-db-cdn@latest/extensions/${extension}/data.json`;
  const { mimeTypes } = await fetch(dbUrl)
  .then((response) => response.json())
  .catch((err) => {
    throw new Error('Not Found');
  });
  return mimeTypes ?? [];
}
