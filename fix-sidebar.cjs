const fs = require('fs');
const code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
const newCode = `import React, { useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  Square,
  Minus,
  Link,
  Code,
  Sparkles,
` + code;
fs.writeFileSync('src/components/Sidebar.tsx', newCode);
