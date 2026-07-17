const fs = require('fs');
const code = fs.readFileSync('src/components/Inspector.tsx', 'utf8');
const { parse } = require('@babel/parser');
const base = code.split('\n').slice(0, 2026).join('\n');
const endings = [
  "",
  "\n  </div>\n)",
  "\n  </div>\n</div>\n)",
  "\n</div>\n</div>\n</div>\n)",
  "\n          </div>\n        )}\n      </div>\n    </div>\n  );\n}",
  "\n        )}\n      </div>\n    </div>\n  );\n}",
  "\n      </div>\n    </div>\n  );\n}",
  "\n    </div>\n  );\n}",
  "\n  );\n}"
];
for (let e of endings) {
  try {
    parse(base + e, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    console.log("Success with ending:\n" + e);
    fs.writeFileSync('src/components/Inspector.tsx', base + e);
    process.exit(0);
  } catch (err) {
  }
}
// Try adding up to 10 </div>
for(let divs=1; divs<=10; divs++) {
  try {
    let e = "\n" + "</div>\n".repeat(divs) + ");\n}";
    parse(base + e, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    console.log("Success with " + divs + " divs");
    fs.writeFileSync('src/components/Inspector.tsx', base + e);
    process.exit(0);
  } catch(err) {}
  
  try {
    let e = "\n" + "</div>\n".repeat(divs) + ")}\n" + "</div>\n".repeat(2) + ");\n}";
    parse(base + e, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    console.log("Success with " + divs + " divs + )}", " + 2 divs");
    fs.writeFileSync('src/components/Inspector.tsx', base + e);
    process.exit(0);
  } catch(err) {}
}
