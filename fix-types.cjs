const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const regex = /buttonStyles:\s*any\[\];/;
const replacement = 'buttonStyles: ButtonPreset[];';

code = code.replace(regex, replacement);

const buttonPresetInterface = `
export interface ButtonPreset {
  id: string;
  name: string;
  style: Pick<BlockStyle, 'backgroundColor' | 'color' | 'borderRadius' | 'fontWeight' | 'paddingTop' | 'paddingBottom' | 'paddingLeft' | 'paddingRight' | 'borderColor' | 'borderWidth'>;
}
`;

if (!code.includes('export interface ButtonPreset')) {
  code += buttonPresetInterface;
}

fs.writeFileSync('src/types.ts', code);
