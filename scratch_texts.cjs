const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'RobotChat.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Convert color: white to color: var(--text-main) globally
css = css.replace(/color:\s*white;?/gi, 'color: var(--text-main);');
css = css.replace(/color:\s*#fff;?/gi, 'color: var(--text-main);');
css = css.replace(/color:\s*#ffffff;?/gi, 'color: var(--text-main);');

// BUT revert back the solid colored buttons
const solidButtons = [
    '.add-btn-primary',
    '.confirm-btn-footer',
    '.final-checkout-btn',
    '.btn-primary',
    '.checkout-btn',
    '.status-btn',
    '.order-id-badge',
    '.table-badge', 
    '.cart-indicator'
];

solidButtons.forEach(btn => {
    // If the block contains var(--text-main), we change it back to white
    // Match the class block specifically
    const rx = new RegExp(`(${btn.replace('.', '\\.')}\\s*\\{[^}]*?)color:\\s*var\\(--text-main\\)([^}]*\\})`, 'g');
    css = css.replace(rx, '$1color: white$2');
});

// Fix rgba transparencies that rely on white
css = css.replace(/color:\s*rgba\(255,\s*255,\s*255,\s*0\.([0-9]+)\)/gi, 'color: var(--text-muted)');

// The Category Chips
// Unselected uses glass/dim. Selected uses primary/white!
// I'll manually set the selected one to white.
css = css.replace(/(\.category-chip\.active\s*\{[^}]*?)color:\s*var\(--text-main\)/g, '$1color: white');


fs.writeFileSync(cssPath, css);
console.log('Fixed text colors in CSS');
