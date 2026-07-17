const fs = require('fs');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');

let lines = code.split('\n');
let open = 0;
let inRender = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('<div id="editor-inspector"')) {
    inRender = true;
  }
  
  if (inRender) {
    const opens = (line.match(/<div[^>]*>/g) || []).length;
    const selfClosing = (line.match(/<div[^>]*\/>/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    
    open += opens - selfClosing;
    open -= closes;
    if (i > 770 && i < 800) {
      console.log(i+1, open, line.trim());
    }
  }
}
