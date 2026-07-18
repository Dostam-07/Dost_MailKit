const fs = require('fs');
let code = fs.readFileSync('src/components/Canvas.tsx', 'utf8');

const lockBtnRegex = /<button[\s\S]*?id={\`btn-toggle-lock-\${block\.id}\`}[\s\S]*?<\/button>/;

const replacement = `{(block.type === 'text' || block.type === 'header' || block.type === 'quote') && !block.locked && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectBlock(block.id); document.getElementById('textarea-inspector-content')?.focus(); }}
                          className="p-1 text-violet-400 hover:text-violet-300 hover:bg-violet-900/30 transition-colors cursor-pointer"
                          title="Magic Copy (AI Rewrite)"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                        </button>
                      )}
                      $&`;

code = code.replace(lockBtnRegex, replacement);
fs.writeFileSync('src/components/Canvas.tsx', code);
