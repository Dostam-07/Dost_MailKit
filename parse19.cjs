const fs = require('fs');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');
let open = 0;
let lines = code.split('\n');
for (let i = 1480; i < 2033; i++) {
  const line = lines[i];
  const old = open;
  open += (line.match(/\{/g) || []).length;
  open -= (line.match(/\}/g) || []).length;
  if (open !== old) {
    console.log((i+1) + ": " + old + "->" + open + " | " + line.trim());
  }
}
