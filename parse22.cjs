const fs = require('fs');
const { parse } = require('@babel/parser');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');

const lines = code.split('\n');
let copy = [...lines];
copy.splice(2027, 1);

try {
  parse(copy.join('\n'), { sourceType: 'module', plugins: ['jsx', 'typescript'] });
} catch(err) {
  console.log("Error at line: " + err.loc.line + " col: " + err.loc.column);
  console.log("Line content: " + copy[err.loc.line - 1]);
}
