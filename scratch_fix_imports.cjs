const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'AdminPanel.jsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    /import \{\s*Search,/g,
    `import {
  Bell,
  Zap,
  ChevronLeft,
  BookOpen,
  Search,`
);

fs.writeFileSync(file, code);
console.log('Fixed Lucide Icons imports in AdminPanel.jsx');
