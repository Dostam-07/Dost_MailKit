const fs = require('fs');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');
const lines = code.split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  depth += (line.match(/\(/g) || []).length;
  depth -= (line.match(/\)/g) || []).length;
}
console.log("Final Paren Depth: " + depth);
