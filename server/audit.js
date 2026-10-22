import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve('..');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file === '.git') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = walk(projectRoot);

// 1. TypeScript files
const tsFiles = allFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

// 2. Client console.log
const clientFiles = allFiles.filter(f => f.includes(path.sep + 'client' + path.sep + 'src') && (f.endsWith('.js') || f.endsWith('.jsx')));
let clientConsoleCount = 0;
for (const f of clientFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(/console\.log/g);
  if (matches) clientConsoleCount += matches.length;
}

// 3. Server console.log
const serverFiles = allFiles.filter(f => f.includes(path.sep + 'server') && f.endsWith('.js'));
let serverConsoleMatches = [];
for (const f of serverFiles) {
  if (f.endsWith('audit.js')) continue;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('console.log')) {
      serverConsoleMatches.push(`${path.basename(f)}:${idx + 1}: ${line.trim()}`);
    }
  });
}

// 4. TODO
let todoCount = 0;
for (const f of allFiles) {
  if (f.endsWith('audit.js')) continue;
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(/TODO/g);
  if (matches) todoCount += matches.length;
}

// 5. lorem
let loremCount = 0;
for (const f of allFiles) {
  if (f.endsWith('audit.js')) continue;
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(/lorem/gi);
  if (matches) loremCount += matches.length;
}

// 6. Tax Invoice
let taxInvoiceCount = 0;
for (const f of allFiles) {
  if (f.endsWith('audit.js')) continue;
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(/tax invoice/gi);
  if (matches) taxInvoiceCount += matches.length;
}

// 7. GST
let gstCount = 0;
let gstMatches = [];
for (const f of allFiles) {
  if (f.endsWith('audit.js')) continue;
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(/\bGST\b/g);
  if (matches) {
    gstCount += matches.length;
    gstMatches.push(path.relative(projectRoot, f));
  }
}

console.log('--- AUDIT RESULTS ---');
console.log('1. TypeScript (.ts/.tsx) files:', tsFiles.length);
console.log('2. Client console.log occurrences:', clientConsoleCount);
console.log('3. Server console.log occurrences:', serverConsoleMatches.length);
console.log('4. "TODO" occurrences:', todoCount);
console.log('5. "lorem" occurrences:', loremCount);
console.log('6. "Tax Invoice" occurrences:', taxInvoiceCount);
console.log('7. "GST" occurrences:', gstCount);
gstMatches.forEach(m => console.log('   * GST in:', m));
console.log('---------------------');
