#!/bin/sh
# Rebuilds js/bundle.js: every file in js/ plus three.js, in one plain script.
#
# Why: browsers won't run JavaScript modules from a file:// address, so when
# index.html is opened straight from disk (double-clicked), it loads this
# bundle instead. Online and on a local server the modules in js/ are used,
# so this file only matters for opening the site from disk.
#
# Run it after changing anything in js/:   sh tools/build-file-bundle.sh
# Needs Node. Installs nothing into this folder (uses a temporary one).

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cd "$TMP"
npm init -y >/dev/null
# Same three.js version as the importmap in index.html
npm install --silent --no-audit --no-fund --cache "$TMP/cache" esbuild@0.24.0 three@0.170.0

./node_modules/.bin/esbuild "$ROOT/js/main.js" \
  --bundle --format=iife --minify --target=es2020 \
  --alias:three="$TMP/node_modules/three/build/three.module.js" \
  --legal-comments=none \
  --banner:js="/* Built by tools/build-file-bundle.sh from js/*.js. Don't edit by hand. */" \
  --outfile="$ROOT/js/bundle.js"

echo "Wrote js/bundle.js"
