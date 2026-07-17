const fs = require('fs');
const { parse } = require('@babel/parser');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');

const lines = code.split('\n');
let copy = [...lines];
copy.splice(2027, 1); // remove line 2028 (index 2027)

try {
  parse(copy.join('\n'), { sourceType: 'module', plugins: ['jsx', 'typescript'] });
  console.log("Success!");
} catch(err) {
  console.log(err.message);
}
