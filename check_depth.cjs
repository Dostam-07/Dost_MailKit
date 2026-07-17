const fs = require('fs');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');
const lines = code.split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const oldDepth = depth;
  depth += (line.match(/<div/g) || []).length;
  depth -= (line.match(/<\/div>/g) || []).length;
  if (depth !== oldDepth) {
    // console.log((i+1) + " | " + depth);
  }
  if (i >= 1200 && i <= 1480) {
     if ((i+1) % 10 === 0) console.log((i+1) + " | " + depth);
  }
}
