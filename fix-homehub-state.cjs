const fs = require('fs');
let code = fs.readFileSync('src/components/HomeHub.tsx', 'utf8');

const stateRegex = /const \[isAiPromptOpen, setIsAiPromptOpen\] = useState\(false\);/;
const replacementState = `const [activeTab, setActiveTab] = useState<'projects' | 'templates' | 'brands'>('projects');
  const [isAiPromptOpen, setIsAiPromptOpen] = useState(false);`;

code = code.replace(stateRegex, replacementState);

const importRegex = /import { STARTER_TEMPLATES } from '\.\.\/utils\/templates';/;
const replacementImport = `import { STARTER_TEMPLATES } from '../utils/templates';
import TemplatesGallery from './TemplatesGallery';
import BrandHub from './BrandHub';`;

code = code.replace(importRegex, replacementImport);

fs.writeFileSync('src/components/HomeHub.tsx', code);
