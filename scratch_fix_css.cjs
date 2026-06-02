const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'RobotChat.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Remove the forced variables in .video-call-bg
css = css.replace(/\/\* FORCE DARK MODE THEME TOKENS FOR AI WAITER INTERFACE \*\/[\s\S]*?--accent-color: #7c3aed !important;\s*/g, '');

// 2. Fix the background colors
// - background-color: #000 (main bg) -> background-color: var(--bg-deep)
css = css.replace(/background-color:\s*#000/g, 'background-color: var(--bg-deep)');

// - background: #111 (avatar header bg etc)
css = css.replace(/background:\s*#111;?/gi, 'background: var(--bg-primary);');

// - background: #1a1a1e (menus, modals, categories)
css = css.replace(/background:\s*#1a1a1e;?/gi, 'background: var(--card-bg);');

// - background: #222 (active borders or hover areas)
css = css.replace(/background:\s*#222;?/gi, 'background: var(--bg-secondary);');

// - background: #000 (bottom gradients or strict backgrounds) -> var(--bg-deep)
css = css.replace(/background:\s*#000;?/gi, 'background: var(--bg-deep);');

// Notice: DO NOT blindly replace text colors like color: white!
// Instead, there are specific rgba(0,0,0, 0.5) !important forcing things dark
css = css.replace(/background:\s*rgba\(0,\s*0,\s*0,\s*0\.5\)\s*!important/g, 'background: var(--bg-glass) !important');
css = css.replace(/background:\s*rgba\(0,\s*0,\s*0,\s*0\.4\)\s*!important/g, 'background: var(--bg-glass) !important');
css = css.replace(/background:\s*rgba\(0,\s*0,\s*0,\s*0\.5\)/g, 'background: var(--bg-glass)');

// The CSS color: white !important that is on header-badge
css = css.replace(/color:\s*white\s*!important/g, 'color: var(--text-main) !important');

// We also have gradients like top-call-gradient which use black
css = css.replace(/rgba\(0,\s*0,\s*0,\s*0\.8\)/g, 'rgba(var(--accent-primary-rgb), 0)'); // remove the harsh black gradient

fs.writeFileSync(cssPath, css);
console.log('Done migrating CSS specific fixes');
