const fs = require('fs');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');
let open = 0;
let lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const oldOpen = open;
  open += (line.match(/\{/g) || []).length;
  open -= (line.match(/\}/g) || []).length;
  if (open !== oldOpen) {
     console.log(i + 1, oldOpen + "->" + open, line.trim());
  }
}
