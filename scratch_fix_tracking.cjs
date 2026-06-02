const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'RobotChat.css');
let css = fs.readFileSync(cssPath, 'utf8');

// The main Tracking Modal background
css = css.replace(/background:\s*rgba\(10,\s*10,\s*15,\s*0\.98\);/gi, 'background: var(--card-bg);');

// The tracking buttons backgrounds
css = css.replace(/\.close-tracking-btn\s*\{[^}]*?background:\s*rgba\(255,\s*255,\s*255,\s*0\.1\);/gi, (match) => {
    return match.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.1\);/i, 'background: var(--bg-secondary);');
});

// The order tracking cards backgrounds
css = css.replace(/\.order-tracking-card\s*\{[^}]*?background:\s*rgba\(255,\s*255,\s*255,\s*0\.02\);/gi, (match) => {
    return match.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.02\);/i, 'background: var(--bg-tertiary);');
});

css = css.replace(/\.order-items\s*\{[^}]*?background:\s*rgba\(255,\s*255,\s*255,\s*0\.03\);/gi, (match) => {
    return match.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.03\);/i, 'background: var(--bg-primary);');
});

// Tracking Footer btn
css = css.replace(/\.tracking-footer-content\s*\{[^}]*?background:\s*rgba\(255,\s*255,\s*255,\s*0\.03\);/gi, (match) => {
    return match.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.03\);/i, 'background: var(--bg-secondary);');
});

// Fix white borders to var(--border-default)
css = css.replace(/border:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.[0-9]+\)/gi, 'border: 1px solid var(--border-default)');
css = css.replace(/border-top:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.[0-9]+\)/gi, 'border-top: 1px solid var(--border-default)');
css = css.replace(/border-bottom:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.[0-9]+\)/gi, 'border-bottom: 1px solid var(--border-default)');

// Any general modal dark backgrounds remaining
css = css.replace(/background:\s*rgba\(0,\s*0,\s*0,\s*0\.4\);/gi, 'background: var(--bg-glass);');
css = css.replace(/background:\s*rgba\(0,\s*0,\s*0,\s*0\.3\);/gi, 'background: var(--bg-glass);');
css = css.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.05\);/gi, 'background: var(--bg-glass);');


fs.writeFileSync(cssPath, css);


// Fix RobotChat.jsx inline styles for Tracking Modal
const jsxPath = path.join(__dirname, 'src', 'components', 'RobotChat.jsx');
let jsx = fs.readFileSync(jsxPath, 'utf8');

jsx = jsx.replace(
    /color:\s*'rgba\(255,255,255,0\.9\)'/gi,
    "color: 'inherit'"
);
jsx = jsx.replace(
    /borderLeft:\s*'1px solid rgba\(255,255,255,0\.2\)'/gi,
    "borderLeft: '1px solid currentColor'"
);
fs.writeFileSync(jsxPath, jsx);

console.log('Fixed Tracking Modal and remaining hardcoded RGBAs');
