#!/usr/bin/env bash
# Brief: Fetch minified source from npm package 'lru-cache' and store in ./utils/

mkdir -p './utils/'
ln -f './node_modules/lru-cache/dist/esm/index.min.js' './utils/lru-cache.min.js'
