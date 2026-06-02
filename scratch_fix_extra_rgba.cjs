const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'RobotChat.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Fix .modal-input dark background
css = css.replace(/\.modal-input\s*\{[^}]*?background:\s*rgba\(0,\s*0,\s*0,\s*0\.3\);/gi, (match) => {
    return match.replace(/background:\s*rgba\(0,\s*0,\s*0,\s*0\.3\);/i, 'background: var(--input-bg);');
});
css = css.replace(/\.modal-input:focus\s*\{[^}]*?background:\s*rgba\(0,\s*0,\s*0,\s*0\.4\);/gi, (match) => {
    return match.replace(/background:\s*rgba\(0,\s*0,\s*0,\s*0\.4\);/i, 'background: var(--input-bg);');
});

// Fix .cart-summary-footer dark background
css = css.replace(/\.cart-summary-footer\s*\{[^}]*?background:\s*rgba\(0,\s*0,\s*0,\s*0\.3\);/gi, (match) => {
    return match.replace(/background:\s*rgba\(0,\s*0,\s*0,\s*0\.3\);/i, 'background: var(--bg-tertiary);');
});

// Revert .modal-input border to var(--input-border)
css = css.replace(/\.modal-input\s*\{[^}]*?border:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.1\);/gi, (match) => {
    return match.replace(/border: 1px solid rgba\(255, 255, 255, 0\.1\);/i, 'border: 1px solid var(--input-border);');
});

fs.writeFileSync(cssPath, css);
console.log('Fixed additional dark rgba backgrounds for Light Mode');
