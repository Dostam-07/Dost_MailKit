const fs = require('fs');
const { parse } = require('@babel/parser');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');

// The original file ends with:
// 2028:           </div>
// 2029:         )}
// 2030:       </div>
// 2031:     </div>
// 2032:   );
// 2033: }

let base = code.split('\n').slice(0, 2027).join('\n');

for (let i = 0; i < 15; i++) {
  let ending = "\n" + "</div>\n".repeat(i) + ");\n}";
  try {
    parse(base + ending, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    console.log("Success with " + i + " divs!");
    fs.writeFileSync('src/components/Inspector.tsx', base + ending);
    process.exit(0);
  } catch(e) {}
}

console.log("Failed all");
