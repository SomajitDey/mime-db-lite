import { mimeToExtensions, extensionToMimes } from './index.js';
import { describe, test } from 'node:test';
import assert from 'node:assert';

describe('Testing index.js', () => {
  test('mimeToExtensions()', async () => {
    const extension = 'js';
    const mimeTypeSpecs = [
      'application/javascript; charset=utf-8',
      'application/javascript'
    ];

    for (const mimeTypeSpec of mimeTypeSpecs) {
      assert.equal(
        await mimeToExtensions(mimeTypeSpec)
          .then((extensions) => extensions.includes(extension)),
        true
      );
    }
  });

  test('Error for mimeToExtensions()', async () => {
    const fakeMimeType = 'type/subtype';
    assert.rejects(
      mimeToExtensions(fakeMimeType),
      { message: 'Not Found' }
    );
  });

  test('extensionToMimes()', async () => {
    const mimeType = 'application/javascript';
    const args = [
      'dir/subdir/path.js',
      'js',
      '.js',
      'path.js',
      'dir/subdir/path.version.js'
    ];
    for (const arg of args) {
      assert.equal(
        await extensionToMimes(arg)
          .then((mimeTypes) => mimeTypes.includes(mimeType)),
        true
      );
    }
  });

  test('Error for extensionToMimes()', async () => {
    const fakeExtension = 'extension';
    assert.rejects(
      extensionToMimes(fakeExtension),
      { message: 'Not Found' }
    );
  });
});
