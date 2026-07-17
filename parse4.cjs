const fs = require('fs');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');
const { parse } = require('@babel/parser');
const lines = code.split('\n');
// We replace the rest of the lines with generic closing
for (let i = 2000; i >= 400; i-=50) {
  let partial = lines.slice(0, i).join('\n');
  let success = false;
  for(let divs=1; divs<=6; divs++) {
    for(let closingTags of ["", ")}", ")}</div>", ")}</div></div>", ")}</div></div></div>"]) {
        try {
          parse(partial + "\n" + closingTags + "\n" + "</div>\n".repeat(divs) + ");\n}", { sourceType: 'module', plugins: ['jsx', 'typescript'] });
          success = true;
          break;
        } catch(e) {}
    }
    if (success) break;
  }
  if (!success) {
     console.log("Failed at length: " + i);
     // Try to print the error for length i+50
     try {
       parse(lines.slice(0, i+50).join('\n') + "\n</div></div></div></div></div></div></div>);\n}", { sourceType: 'module', plugins: ['jsx', 'typescript'] });
     } catch (e) {
       console.log("Error at i+50: ", e.message);
     }
  } else {
     console.log("Success at length: " + i);
     break;
  }
}
