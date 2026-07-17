const fs = require('fs');
const { parse } = require('@babel/parser');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');

try {
  const ast = parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
} catch (e) {
  // If it's a parse error, we can't get the AST.
}

// Instead, let's remove </div> tags one by one from the BOTTOM of the file.
// If the file is missing an opening <div>, then removing a closing </div> should fix it.
const lines = code.split('\n');
for (let i = lines.length - 1; i > 2000; i--) {
  if (lines[i].includes('</div>')) {
    let copy = [...lines];
    copy.splice(i, 1);
    try {
      parse(copy.join('\n'), { sourceType: 'module', plugins: ['jsx', 'typescript'] });
      console.log("Success! Removed </div> at line " + (i+1));
      process.exit(0);
    } catch(err) {}
  }
}
console.log("Failed");
