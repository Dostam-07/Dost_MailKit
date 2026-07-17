const fs = require('fs');
const content = fs.readFileSync('src/components/Inspector.tsx', 'utf8');
let open = 0;
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div[^>]*>/g) || []).length;
  // if it's self-closing <div /> we subtract 1
  const selfClosing = (line.match(/<div[^>]*\/>/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  open += opens - selfClosing;
  open -= closes;
  if (i > 2020) console.log(i + 1, open, line.trim());
}
