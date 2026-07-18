const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const themeSection = `
:root {
  --color-ink-val: #F8FAFC;
  --color-ink-2-val: #F1F5F9;
  --color-paper-val: #FFFFFF;
  --color-paper-2-val: #E2E8F0;
  --color-text-on-ink-val: #0F172A;
  --color-text-on-ink-muted-val: #475569;
  --color-text-on-paper-val: #1E293B;
}

.dark {
  --color-ink-val: #16233B;
  --color-ink-2-val: #1D2E4A;
  --color-paper-val: #F1E9D8;
  --color-paper-2-val: #E8DEC8;
  --color-text-on-ink-val: #F3ECDD;
  --color-text-on-ink-muted-val: #B9C0CC;
  --color-text-on-paper-val: #16233B;
}

@theme {
  --color-ink: var(--color-ink-val);
  --color-ink-2: var(--color-ink-2-val);
  --color-paper: var(--color-paper-val);
  --color-paper-2: var(--color-paper-2-val);
  --color-text-on-ink: var(--color-text-on-ink-val);
  --color-text-on-ink-muted: var(--color-text-on-ink-muted-val);
  --color-text-on-paper: var(--color-text-on-paper-val);
`;

code = code.replace(/@theme \{[\s\S]*?--color-text-on-paper: #16233B;/, themeSection);
fs.writeFileSync('src/index.css', code);
