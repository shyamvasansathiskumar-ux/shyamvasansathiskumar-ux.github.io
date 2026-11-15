#!/bin/bash
# Bundles src/world.js and the parts of three.js it uses into one classic script, so it can carry an SRI hash.
# Needs: npm install three@0.187.0 esbuild@0.28.2 (in any folder), then point NODE_PATH at its node_modules.
set -e
cd "$(dirname "$0")/.."
npx esbuild src/world.js --bundle --minify --format=iife --target=es2019 --legal-comments=none \
  --banner:js="/* The 3D scene. Includes three.js (MIT, https://threejs.org), see licenses/three.js-LICENSE.txt */" \
  --outfile=assets/js/world.js
python3 tools/sri.py .
