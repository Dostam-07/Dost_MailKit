const fs = require('fs');
const { parse } = require('@babel/parser');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');

const lines = code.split('\n');
const base = lines.slice(0, 2024).join('\n');
const endings = [
  "\n  );\n}",
  "\n</div>\n  );\n}",
  "\n</div>\n</div>\n  );\n}",
  "\n</div>\n</div>\n</div>\n  );\n}",
  "\n)}\n</div>\n</div>\n  );\n}",
  "\n</div>\n)}\n</div>\n</div>\n  );\n}",
  "\n</div>\n</div>\n)}\n</div>\n</div>\n  );\n}"
];

for(let e of endings) {
  try {
     parse(base + e, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
     console.log("Success! " + JSON.stringify(e));
     process.exit(0);
  } catch(err) {
     console.log("Failed " + JSON.stringify(e) + " with " + err.message);
  }
}
