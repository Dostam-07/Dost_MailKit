const fs = require('fs');
let code = fs.readFileSync('src/blocks/registry.ts', 'utf8');

const restoreToAdvanced = ['footer', 'imageGrid', 'htmlEmbed', 'countdown'];
for (const b of restoreToAdvanced) {
  const re = new RegExp(`(type: '${b}',[\\s\\S]*?label:[\\s\\S]*?category: )'elements'`);
  code = code.replace(re, "$1'advanced'");
}

fs.writeFileSync('src/blocks/registry.ts', code);
