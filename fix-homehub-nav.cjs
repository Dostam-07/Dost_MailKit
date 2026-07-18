const fs = require('fs');
let code = fs.readFileSync('src/components/HomeHub.tsx', 'utf8');

const navRegex = /<nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-\[0\.15em\] text-text-on-ink-muted">[\s\S]*?<\/nav>/;
const replacementNav = `<nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.15em] text-text-on-ink-muted">
            <button 
              onClick={() => setActiveTab('projects')} 
              className={\`transition-all hover:text-text-on-ink \${activeTab === 'projects' ? 'text-text-on-ink underline decoration-gold decoration-2 underline-offset-4' : ''}\`}
            >
              My Projects
            </button>
            <button 
              onClick={() => setActiveTab('templates')} 
              className={\`transition-all hover:text-text-on-ink \${activeTab === 'templates' ? 'text-text-on-ink underline decoration-gold decoration-2 underline-offset-4' : ''}\`}
            >
              Templates
            </button>
            <button 
              onClick={() => setActiveTab('brands')} 
              className={\`transition-all hover:text-text-on-ink \${activeTab === 'brands' ? 'text-text-on-ink underline decoration-gold decoration-2 underline-offset-4' : ''}\`}
            >
              Brand Hub
            </button>
          </nav>`;

code = code.replace(navRegex, replacementNav);
fs.writeFileSync('src/components/HomeHub.tsx', code);
