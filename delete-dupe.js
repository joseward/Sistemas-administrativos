const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/horarios/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');
const lines = code.split('\n');

// Drop lines 258 to 304 (indices 257 to 303)
lines.splice(258, 305 - 259);

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Deleted duplicate handleAutoAssign!');
