import DB from './index.js';
import semverSatisfies from 'semver/functions/satisfies.js';
import { describe, test } from 'node:test';
import assert from 'node:assert';

const dbWithCache = new DB({ cacheMaxEntries: 2 }); // DONOT change the 2. Used in eviction test below.
const dbWithoutCache = new DB();

describe('Testing index.js', () => {
  test('Hard-coded mime-db-cdn version must match that in devDependencies of package.json', async () => {
    const {
      default: {
        devDependencies: {
          'mime-db-cdn': depVersionRange
        }
      }
    } = await import('./package.json', { with: {type: 'json'} });
    console.log(typeof semverSatisfies, depVersionRange, DB.mimeDbCdnVersion);
    assert.ok(semverSatisfies(DB.mimeDbCdnVersion, depVersionRange));
  })

  test('mimeToExtensions() or getExtensions()', async () => {
    const extension = 'js';
    const mimeTypeSpecs = [
      'application/javascript; charset=utf-8',
      'application/javascript'
    ];

    for (const mimeTypeSpec of mimeTypeSpecs) {
      assert.equal(
        await dbWithCache.getExtensions(mimeTypeSpec)
          .then((extensions) => extensions.includes(extension)),
        true
      );

      assert.equal(
        await dbWithoutCache.getExtensions(mimeTypeSpec)
          .then((extensions) => extensions.includes(extension)),
        true
      );
    }
  });

  test('Error for mimeToExtensions()', async () => {
    const fakeMimeType = 'type/subtype';
    assert.rejects(
      dbWithCache.mimeToExtensions(fakeMimeType),
      { message: 'Not Found' }
    );

    assert.rejects(
      dbWithoutCache.mimeToExtensions(fakeMimeType),
      { message: 'Not Found' }
    );
  });

  test('extensionToMimes() or getTypes()', async () => {
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
        await dbWithCache.getTypes(arg)
          .then((mimeTypes) => mimeTypes.includes(mimeType)),
        true
      );

      assert.equal(
        await dbWithoutCache.getTypes(arg)
          .then((mimeTypes) => mimeTypes.includes(mimeType)),
        true
      );
    }
  });

  test('Error for extensionToMimes()', async () => {
    const fakeExtension = 'extension';
    assert.rejects(
      dbWithCache.extensionToMimes(fakeExtension),
      { message: 'Not Found' }
    );

    assert.rejects(
      dbWithoutCache.extensionToMimes(fakeExtension),
      { message: 'Not Found' }
    );
  });

  test('extensionToMime() or getType()', async () => {
    assert.equal(
      await dbWithCache.getType('dir/subdir/package.deb'),
      'application/x-debian-package'
    );
  });

  test('Error for extensionToMime()', async () => {
    const fakeExtension = 'extension';
    assert.rejects(
      dbWithCache.extensionToMime(fakeExtension),
      { message: 'Not Found' }
    );
  });

  test('LRU Cache eviction', async () => {
    // Entry #1
    await dbWithCache.getTypes('exe');
    const cache = dbWithCache.cache; // Only stores upto 2 entries
    assert.ok(cache.has('exe'), new Error('Cache is not getting set'));
    // Entry #2
    await dbWithCache.getTypes('mp4');
    assert.ok(cache.has('mp4'), new Error('Cache is not getting set'));
    // Test repetition, should not be entry #3
    await dbWithCache.getTypes('mp4');
    assert.ok(cache.has('exe'), new Error('Cache is not getting set'));
    assert.ok(cache.has('mp4'), new Error('Cache is not getting set'));
    // Testing eviction, entry #3. 'exe' should be evicted as its LRU
    await dbWithCache.getExtensions('application/javascript');
    assert.equal(cache.has('exe'), false, 'Cache eviction failed');
    assert.ok(cache.has('mp4'), new Error('Cache is not getting set'));
    assert.ok(cache.has('application/javascript'), new Error('Cache is not getting set'));
  });

  test('Custom fetch', async () => {
    const extensions = ['test', 'string'];
    const dbWithCustomFetch = new DB({
      fetch: async () => new Response(JSON.stringify({ extensions }))
    });
    assert.deepStrictEqual(
      await dbWithCustomFetch.getExtensions('Test/MIME; any=random'),
      extensions
    );
  });
});
