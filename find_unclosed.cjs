const fs = require('fs');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');
const lines = code.split('\n');
let stack = [];
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  for (let pos = 0; pos < line.length; pos++) {
    if (line.substring(pos, pos + 4) === '<div') { stack.push({ type: 'div', line: i + 1 }); pos += 3; }
    else if (line.substring(pos, pos + 6) === '</div>') { 
      if (stack.length > 0 && stack[stack.length - 1].type === 'div') stack.pop();
      else console.log("Extra </div> at " + (i + 1));
      pos += 5;
    } else if (line[pos] === '{') { stack.push({ type: 'brace', line: i + 1 }); }
    else if (line[pos] === '}') {
      if (stack.length > 0 && stack[stack.length - 1].type === 'brace') stack.pop();
      else console.log("Extra } at " + (i + 1));
    } else if (line[pos] === '(') { stack.push({ type: 'paren', line: i + 1 }); }
    else if (line[pos] === ')') {
      if (stack.length > 0 && stack[stack.length - 1].type === 'paren') stack.pop();
      else console.log("Extra ) at " + (i + 1));
    }
  }
}
stack.forEach(s => console.log("Unclosed " + s.type + " at " + s.line));
