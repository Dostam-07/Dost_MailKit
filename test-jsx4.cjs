const fs = require('fs');
const content = fs.readFileSync('src/components/Inspector.tsx', 'utf8');
let open = 0;
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div[^>]*>/g) || []).length;
  const selfClosing = (line.match(/<div[^>]*\/>/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  open += opens - selfClosing;
  open -= closes;
  console.log(i + 1, open, line.trim());
}
