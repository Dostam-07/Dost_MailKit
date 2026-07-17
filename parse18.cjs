const fs = require('fs');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');
let open = 0;
let lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const old = open;
  open += (line.match(/\{/g) || []).length;
  open -= (line.match(/\}/g) || []).length;
  if (open === 2 && old === 3) {
    console.log("Drops to 2 at line: " + (i+1));
  }
}
