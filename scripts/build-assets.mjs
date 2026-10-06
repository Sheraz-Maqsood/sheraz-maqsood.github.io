import { readFile, writeFile } from 'node:fs/promises';
import { transform } from 'esbuild';
import { createHash } from 'node:crypto';

// Keep readable sources; publish minified siblings with content-based cache keys.
const files = ['assets/css/styles.css', 'assets/css/refresh.css', 'assets/css/living-network.css',
  'assets/js/components.js', 'assets/js/main.js', 'assets/js/project.js', 'assets/js/living-network.js'];
const outputs = [];
for (const file of files) {
  const source = await readFile(file, 'utf8');
  const loader = file.endsWith('.css') ? 'css' : 'js';
  const result = await transform(source, { loader, minify: true, target: 'es2020', legalComments: 'inline' });
  const output = file.replace(/\.(css|js)$/, '.min.$1');
  await writeFile(output, result.code);
  const hash = createHash('sha256').update(result.code).digest('hex').slice(0, 10);
  outputs.push({ file, output, hash });
  console.log(`${file}: ${Buffer.byteLength(source)} -> ${Buffer.byteLength(result.code)} bytes`);
}
for (const page of ['index.html', 'project.html', '404.html']) {
  let html = await readFile(page, 'utf8');
  for (const { file, output, hash } of outputs) {
    const pattern = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\.(css|js)$/, '(?:\\.min)?\\.$1');
    html = html.replace(new RegExp(`(["'])${pattern}(?:\\?[^"']*)?\\1`, 'g'), `"${output}?v=${hash}"`);
  }
  await writeFile(page, html);
}
