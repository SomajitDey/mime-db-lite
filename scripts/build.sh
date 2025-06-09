#!/usr/bin/env bash

# Brief: Fetch minified source from npm package 'lru-cache' and store in ./utils/
mkdir -p ./utils/
ln -f ./node_modules/lru-cache/dist/esm/index.min.js ./utils/lru-cache.min.js

# Minify ./index.js without bundling ./utils/lru-cache.min.js.
# This keeps low footprint in case lru-cache is not imported at run time.
./node_modules/.bin/esbuild ./index.js --format=esm  --minify --outfile=./index.min.js
