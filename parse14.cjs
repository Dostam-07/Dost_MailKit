const fs = require('fs');
const { parse } = require('@babel/parser');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');
const lines = code.split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('</div>')) {
    let copy = [...lines];
    copy[i] = copy[i].replace('</div>', '');
    try {
      parse(copy.join('\n'), { sourceType: 'module', plugins: ['jsx', 'typescript'] });
      console.log("Success by removing </div> at line: " + (i + 1));
      fs.writeFileSync('src/components/Inspector.tsx', copy.join('\n'));
      process.exit(0);
    } catch(e) {}
  }
}
console.log("No single </div> removal fixed it.");
