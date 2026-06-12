const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'AdminPanel.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The specific unassigned block
content = content.replace(
    /style=\{\{ paddingLeft: '12px', borderLeft: '4px solid var\(--text-muted\)', cursor: 'pointer', userSelect: 'none', color: 'var\(--text-main\)' \}\}/,
    "style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '12px', borderLeft: '4px solid var(--text-muted)', cursor: 'pointer', userSelect: 'none', color: 'var(--text-main)' }}"
);

fs.writeFileSync(filePath, content);
console.log('Fixed Unassigned items flexbox formatting in AdminPanel.jsx directly via regex');
