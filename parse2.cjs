const fs = require('fs');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');
const { parse } = require('@babel/parser');
// Let's chop off the last lines and see where it parses successfully
for (let i = 2033; i > 2000; i--) {
  try {
    parse(code.split('\n').slice(0, i).join('\n') + "\n  );\n}", { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    console.log("Success with length: " + i);
    break;
  } catch (e) {
  }
}
