const fs = require('fs');
const path = require('path');
const folders = ['src/components/admin/views', 'src/components/admin/modals'];
folders.forEach(f => {
  fs.readdirSync(f).forEach(file => {
    if(!file.endsWith('.jsx')) return;
    const p = path.join(f, file);
    let lines = fs.readFileSync(p, 'utf8').split('\n');
    let lucideTags = new Set();
    let writeNeeded = false;
    let newLines = [];
    for (let line of lines) {
      if (line.includes("from 'lucide-react'")) {
        const match = line.match(/import\s*\{\s*([^{}]+)\s*\}\s*from\s*'lucide-react'/);
        if (match) {
          match[1].split(',').map(s => s.trim()).filter(Boolean).forEach(t => lucideTags.add(t));
        }
        writeNeeded = true;
      } else {
        newLines.push(line);
      }
    }
    if (writeNeeded && lucideTags.size > 0) {
      const importLine = `import { ${Array.from(lucideTags).join(', ')} } from 'lucide-react';`;
      newLines.unshift(importLine);
      fs.writeFileSync(p, newLines.join('\n'));
      console.log('Deduped ' + file);
    }
  });
});
