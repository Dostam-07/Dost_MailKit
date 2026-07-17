const fs = require('fs');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');
const lines = code.split('\n');
let openBraces = 0;
let openDivs = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  openDivs += (line.match(/<div/g) || []).length;
  openDivs -= (line.match(/<\/div>/g) || []).length;
  openBraces += (line.match(/\{/g) || []).length;
  openBraces -= (line.match(/\}/g) || []).length;
}
console.log("Divs: " + openDivs + ", Braces: " + openBraces);
