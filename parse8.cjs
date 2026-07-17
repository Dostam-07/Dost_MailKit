const fs = require('fs');
const { parse } = require('@babel/parser');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');

try {
  parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
  console.log("Success");
} catch(e) {
  console.log("Error at line", e.loc.line, "col", e.loc.column, ":", e.message);
}
