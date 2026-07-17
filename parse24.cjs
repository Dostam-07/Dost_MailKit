const fs = require('fs');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');

const lines = code.split('\n');
for(let i=0; i<lines.length; i++) {
  const line = lines[i];
  if ((line.match(/</g) || []).length !== (line.match(/>/g) || []).length) {
    // some lines have > inside arrows (=>) or less than (<). So we filter.
    if (line.includes('<div') && !line.includes('>')) {
      console.log("Unclosed div at line " + (i+1) + ": " + line);
    }
  }
}
