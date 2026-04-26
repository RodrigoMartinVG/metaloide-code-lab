const fs = require('fs');
const html = fs.readFileSync('./demo.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.log('No script found'); process.exit(1); }
try {
  new Function(m[1]);
  console.log('JS syntax OK');
} catch(e) {
  console.log('Syntax error:', e.message);
}
