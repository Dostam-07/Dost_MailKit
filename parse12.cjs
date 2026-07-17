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
    
    if (opens - selfClosing !== closes) {
       let oldOpen = open;
       open += opens - selfClosing;
       open -= closes;
       console.log((i+1) + ": " + oldOpen + " -> " + open + " | " + line.trim());
    }
    if (open === 0) {
      console.log("Root div closed at line: " + (i + 1));
      break;
    }
  }
}
