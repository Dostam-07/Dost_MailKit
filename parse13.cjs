const fs = require('fs');
const { parse } = require('@babel/parser');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');

// The error is that we have an EXTRA `</div>`.
// If we delete ONE `</div>` at a time, we might get a successful parse!
const lines = code.split('\n');
for (let i = Math.max(0, lines.length - 200); i < lines.length; i++) {
  if (lines[i].includes('</div>')) {
    let copy = [...lines];
    copy.splice(i, 1); // remove line i
    try {
      parse(copy.join('\n'), { sourceType: 'module', plugins: ['jsx', 'typescript'] });
      console.log("Success by removing </div> at line: " + (i + 1));
    } catch(e) {}
  }
}
