const fs = require('fs');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');
let open = 0;
let lines = code.split('\n');
let lastSeen = {};
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  open += (line.match(/\{/g) || []).length;
  open -= (line.match(/\}/g) || []).length;
  lastSeen[open] = i + 1;
}
console.log(lastSeen);
