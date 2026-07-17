const fs = require('fs');
const { parse } = require('@babel/parser');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');

const lines = code.split('\n');

for (let start = 2000; start > 400; start-=20) {
  let sub = lines.slice(0, start).join('\n') + "\n  );\n}";
  try {
    parse(sub, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    console.log("Success with length: " + start);
  } catch(e) {}
}
