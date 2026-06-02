const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'RobotChat.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace dark hex colors with theme variables
// Dark bg
css = css.replace(/#1a1a1e/gi, 'var(--card-bg)');
css = css.replace(/#12121a/gi, 'var(--card-bg)');
css = css.replace(/#0a0a0f/gi, 'var(--bg-primary)');
css = css.replace(/#111111/gi, 'var(--bg-secondary)');
css = css.replace(/#111([^A-Fa-f0-9])/gi, 'var(--bg-secondary)$1');
css = css.replace(/#050508/gi, 'var(--bg-deep)');
css = css.replace(/#000000/gi, 'var(--bg-deep)');
css = css.replace(/#000([^A-Fa-f0-9])/gi, 'var(--bg-deep)$1');

// Text colors
css = css.replace(/#fff([^A-Fa-f0-9])/gi, 'var(--text-main)$1');
css = css.replace(/#ffffff/gi, 'var(--text-main)');
css = css.replace(/#f1f5f9/gi, 'var(--text-main)');
css = css.replace(/#94a3b8/gi, 'var(--text-dim)');
css = css.replace(/#64748b/gi, 'var(--text-muted)');
css = css.replace(/#333333/gi, 'var(--text-main)');
css = css.replace(/#333([^A-Fa-f0-9])/gi, 'var(--text-main)$1');
css = css.replace(/#222222/gi, 'var(--card-bg)');
css = css.replace(/#222([^A-Fa-f0-9])/gi, 'var(--card-bg)$1');

// rgba colors specifically for borders and overalys
css = css.replace(/background:\s*rgba\(0,\s*0,\s*0,\s*0\.([0-9]+)\)/gi, 'background: var(--bg-hover)');
css = css.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.([0-9]+)\)/gi, 'background: var(--bg-glass)');
css = css.replace(/color:\s*rgba\(255,\s*255,\s*255,\s*0\.([0-9]+)\)/gi, 'color: var(--text-muted)');
css = css.replace(/border(-[a-z]+)?:\s*([0-9]+px\s*(solid)?\s*)rgba\(255,\s*255,\s*255,\s*0\.([0-9]+)\)/gi, 'border$1: $2 var(--border-default)');


// Also replace the !important stuff
css = css.replace(/!important/g, '');

fs.writeFileSync(cssPath, css);
console.log('Done migrating CSS colors');
