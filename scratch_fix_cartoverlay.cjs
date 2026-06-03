const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'CartOverlay.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Header Neural Selection Text
content = content.replace(/color:\s*'rgba\(255,255,255,0\.4\)'/g, "color: 'var(--text-muted)'");

// Empty Cart Texts
content = content.replace(/color:\s*'rgba\(255,255,255,0\.3\)'/g, "color: 'var(--text-dim)'");
content = content.replace(/color="rgba\(255,255,255,0\.2\)"/g, "color=\"var(--text-dim)\"");
content = content.replace(/background:\s*'rgba\(255,255,255,0\.05\)'/g, "background: 'var(--bg-secondary)'");

// Footer Subtotal texts
content = content.replace(/color:\s*'rgba\(255,255,255,0\.6\)'/g, "color: 'var(--text-muted)'");
content = content.replace(/borderBottom:\s*'1px solid rgba\(255,255,255,0\.1\)'/g, "borderBottom: '1px solid var(--border-default)'");

fs.writeFileSync(filePath, content);
console.log('Fixed Light Mode inline styling texts in CartOverlay.jsx');
