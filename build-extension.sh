#!/usr/bin/env bash
# Regenerate the Chrome/Edge extension's content script from the userscript.
# The userscript is the single source of truth; run this after editing it.
set -euo pipefail
cd "$(dirname "$0")"

{
  echo '/* Generated from ../bo-quick-actions.user.js — do not edit here. Run ./build-extension.sh after changing the userscript. */'
  sed '/^\/\/ ==UserScript==/,/^\/\/ ==\/UserScript==/d' bo-quick-actions.user.js
} > chrome-extension/quick-actions.js

echo "Updated chrome-extension/quick-actions.js"
