const fs = require('fs');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');
const { parse } = require('@babel/parser');
try {
  parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
} catch (e) {
  console.log("Error at line", e.loc.line, "col", e.loc.column);
  console.log("Message:", e.message);
}
