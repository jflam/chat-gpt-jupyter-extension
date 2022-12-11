#!/bin/bash

rm -rf build

npx esbuild src/content-script/index.mjs src/content-script/inject.js src/background/index.mjs --bundle --outdir=build

cp src/*.png build/
cp src/manifest.json build/manifest.json
