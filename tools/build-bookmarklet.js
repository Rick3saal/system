#!/usr/bin/env node
/*
 * Generates the extension-free ways to run the tool:
 *   bookmarklet.txt      - a single javascript: URL for a bookmark
 *   bookmarklet.html     - drag-and-drop helper page
 *   devtools-snippet.js  - code to paste once into DevTools > Sources > Snippets
 *
 * Run with: npm install && npm run build:bookmarklet
 */
const fs = require('fs');
const path = require('path');
const terser = require('terser');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'chrome-extension', 'quick-actions.js'), 'utf8');

async function main() {
  const result = await terser.minify(source, {
    compress: true,
    mangle: true,
    format: { comments: false, semicolons: true }
  });
  if (result.error) throw result.error;

  const code = result.code;
  const bookmarklet = 'javascript:' + encodeURIComponent(code);

  fs.writeFileSync(path.join(root, 'bookmarklet.txt'), bookmarklet + '\n');

  fs.writeFileSync(path.join(root, 'devtools-snippet.js'),
    '// Paste this whole file into Chrome DevTools > Sources > Snippets, name it "BO Quick Actions",\n' +
    '// then run it with Ctrl+Enter (Cmd+Enter on Mac) after each page load.\n' +
    '// See README.md > "If extensions are blocked".\n' +
    code + '\n');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>BO Quick Actions — bookmarklet installer</title>
<style>
  body { font:15px/1.6 -apple-system,Segoe UI,Arial,sans-serif; color:#e5e7eb; background:#0f172a; margin:0; padding:32px; }
  main { max-width:760px; margin:0 auto; }
  h1 { color:#fff; margin:0 0 8px; }
  p { color:#cbd5e1; }
  .drag { display:inline-block; margin:18px 0; padding:14px 22px; background:#2563eb; color:#fff;
         border-radius:10px; font-weight:bold; cursor:grab; text-decoration:none; box-shadow:0 6px 18px rgba(0,0,0,.3); }
  textarea { width:100%; height:110px; box-sizing:border-box; background:#1e293b; color:#93c5fd;
             border:1px solid #475569; border-radius:8px; padding:10px; font:12px/1.5 monospace; }
  button { padding:9px 14px; border:0; border-radius:8px; background:#334155; color:#fff; cursor:pointer; }
  ol { color:#cbd5e1; }
  code { background:#1e293b; padding:2px 5px; border-radius:4px; }
</style>
</head>
<body>
<main>
  <h1>BO Quick Actions — no extension needed</h1>
  <p>Drag this button onto your browser's bookmarks bar (press <code>Ctrl+Shift+B</code> if the bar is hidden):</p>
  <a class="drag" draggable="true" href="${bookmarklet}">📞 BO Quick Actions</a>
  <p>Then open the BO leads list and click the new bookmark once. The Call / Text / Email buttons and the ⚙️ settings button will appear. Repeat that click after each full page reload.</p>
  <h2>Can't drag it? Create the bookmark manually</h2>
  <ol>
    <li>Right-click the bookmarks bar → <b>Add page…</b> (or <b>Bookmark manager → Add new bookmark</b>).</li>
    <li>Name it <b>BO Quick Actions</b>.</li>
    <li>Copy the entire line below into the URL field and save.</li>
  </ol>
  <textarea id="bm" readonly>${bookmarklet.replace(/</g, '&lt;')}</textarea>
  <p><button id="copy" type="button">Copy bookmarklet URL</button> <span id="status"></span></p>
  <p style="color:#fca5a5">If your browser removes the <code>javascript:</code> prefix when pasting, drag the button above instead, or use the DevTools Snippet method in <code>README.md</code>.</p>
</main>
<script>
  document.getElementById('copy').addEventListener('click', function () {
    var field = document.getElementById('bm');
    field.select();
    try { document.execCommand('copy'); document.getElementById('status').textContent = 'Copied!'; }
    catch (e) { document.getElementById('status').textContent = 'Select the text and copy it manually.'; }
  });
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(root, 'bookmarklet.html'), html);

  console.log(`Wrote bookmarklet.txt (${bookmarklet.length} chars), bookmarklet.html, devtools-snippet.js (${code.length} chars)`);
}

main().catch((err) => { console.error(err); process.exit(1); });
