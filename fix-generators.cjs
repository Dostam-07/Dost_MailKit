const fs = require('fs');

// Fix htmlGenerator.ts
let htmlCode = fs.readFileSync('src/utils/htmlGenerator.ts', 'utf8');
const htmlAnchor = /case 'html':[\s\S]*?break;/;

const newHtmlElements = `case 'shape':
        blockHtml = \`<div style="text-align: \${block.style.textAlign || 'center'};">
          <div style="display: inline-block; width: \${block.props?.width || '100px'}; height: \${block.props?.height || '100px'}; background-color: \${block.props?.fillColor || '#3b82f6'}; border-radius: \${block.props?.shapeType === 'circle' ? '50%' : (block.props?.shapeType === 'blob' ? '30% 70% 70% 30% / 30% 30% 70% 70%' : '0')};"></div>
        </div>\`;
        break;
      case 'line':
        blockHtml = \`<div style="padding: 10px 0;">
          <div style="width: 100%; height: \${block.props?.thickness || '1px'}; background-color: \${block.props?.color || '#e2e8f0'}; border-top: \${block.props?.lineStyle === 'dashed' ? (block.props?.thickness || '1px') + ' dashed ' + (block.props?.color || '#e2e8f0') : (block.props?.lineStyle === 'dotted' ? (block.props?.thickness || '1px') + ' dotted ' + (block.props?.color || '#e2e8f0') : 'none')};"></div>
        </div>\`;
        break;
      case 'icon':
        blockHtml = \`<div style="text-align: \${block.style.textAlign || 'center'}; color: \${block.props?.fillColor || '#f59e0b'};">
          <svg style="width: \${block.props?.width || '40px'}; height: \${block.props?.width || '40px'};" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>\`;
        break;
      $&`;

if (!htmlCode.includes("case 'shape':")) {
  htmlCode = htmlCode.replace(htmlAnchor, newHtmlElements);
  fs.writeFileSync('src/utils/htmlGenerator.ts', htmlCode);
}

// Fix mjmlGenerator.ts
let mjmlCode = fs.readFileSync('src/utils/mjmlGenerator.ts', 'utf8');
const mjmlAnchor = /case 'html':[\s\S]*?break;/;

const newMjmlElements = `case 'shape':
        blockMjml = \`
          <mj-text align="\${block.style.textAlign || 'center'}" padding="0">
            <div style="display: inline-block; width: \${block.props?.width || '100px'}; height: \${block.props?.height || '100px'}; background-color: \${block.props?.fillColor || '#3b82f6'}; border-radius: \${block.props?.shapeType === 'circle' ? '50%' : (block.props?.shapeType === 'blob' ? '30% 70% 70% 30% / 30% 30% 70% 70%' : '0')};"></div>
          </mj-text>
        \`;
        break;
      case 'line':
        blockMjml = \`
          <mj-divider border-width="\${block.props?.thickness || '1px'}" border-style="\${block.props?.lineStyle || 'solid'}" border-color="\${block.props?.color || '#e2e8f0'}" padding="10px 0" />
        \`;
        break;
      case 'icon':
        blockMjml = \`
          <mj-text align="\${block.style.textAlign || 'center'}" padding="0" color="\${block.props?.fillColor || '#f59e0b'}">
            <svg style="width: \${block.props?.width || '40px'}; height: \${block.props?.width || '40px'};" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </mj-text>
        \`;
        break;
      $&`;

if (!mjmlCode.includes("case 'shape':")) {
  mjmlCode = mjmlCode.replace(mjmlAnchor, newMjmlElements);
  fs.writeFileSync('src/utils/mjmlGenerator.ts', mjmlCode);
}

