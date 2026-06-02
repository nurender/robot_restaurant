const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'RobotChat.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace white color except when explicitly in buttons
css = css.replace(/color:\s*white;?/gi, 'color: var(--text-main);');
css = css.replace(/color:\s*#fff;?/gi, 'color: var(--text-main);');
css = css.replace(/color:\s*#ffffff;?/gi, 'color: var(--text-main);');

// Replace hex white
css = css.replace(/border(-color)?:\s*(.*?)white/gi, 'border$1: $2var(--border-default)');


// Re-enforce white text on buttons
const buttons = [
    '.add-btn-primary',
    '.confirm-btn-footer',
    '.final-checkout-btn',
    '.btn-primary',
    '.theme-btn',
    '.checkout-btn',
    '.status-btn'
];

buttons.forEach(btn => {
    const rx = new RegExp(`(${btn.replace('.', '\\.')}\\s*\\{[^}]*?)color:\\s*var\\(--text-main\\)([^}]*\\})`, 'g');
    css = css.replace(rx, '$1color: white$2');
});


// Also update rgba for text transparency
css = css.replace(/color:\s*rgba\(255,\s*255,\s*255,\s*0\.([0-9]+)\)/gi, 'color: var(--text-muted)');

// The menu container itself text
css = css.css?.replace || css;

fs.writeFileSync(cssPath, css);
console.log('Done fixing css text colors');
