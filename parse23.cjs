const fs = require('fs');
const { parse } = require('@babel/parser');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');

const lines = code.split('\n');

// Try removing all closing divs at the end
let base = lines.slice(0, 2025);
for (let i = 0; i <= 5; i++) {
  for (let j = 0; j <= 5; j++) {
    let ending = "\n" + "</div>\n".repeat(i) + ")}\n".repeat(j) + ");\n}";
    try {
      parse(base.join('\n') + ending, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
      console.log("Success with " + i + " divs and " + j + " )}");
    } catch(err) {}
  }
}
