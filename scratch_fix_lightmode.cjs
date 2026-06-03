const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'AdminPanel.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Separate Light Mode and Dark Mode variables
css = css.replace(
    /:root,[\s\S]*?--card-border:\s*rgba\(255, 255, 255, 0\.08\);\s*\}/,
    `:root, [data-theme="dark"] {
  /* AI RESTO Premium SaaS Dark Mode Overrides */
  --ap-sidebar-bg: #09090b; 
  --ap-sidebar-hover: rgba(124, 58, 237, 0.15);
  --ap-header-bg: rgba(9, 9, 11, 0.8);
  --ap-main-bg: #050508;
  --ap-accent-color: #8b5cf6; 
  --ap-accent-glow: rgba(139, 92, 246, 0.5);
  --ap-success: #10b981; 
  --ap-text-main: #ffffff;
  --ap-text-dim: #a1a1aa; 
  --ap-text-muted: #71717a; 
  --ap-glass-bg: rgba(24, 24, 27, 0.6); 
  --ap-glass-border: rgba(255, 255, 255, 0.08);
  --ap-card-bg: rgba(24, 24, 27, 0.4);

  --accent-color: #8b5cf6;
  --glass-bg: rgba(24, 24, 27, 0.6);
  --glass-border: rgba(255, 255, 255, 0.08);
  --premium-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  
  --card-bg: #09090b;
  --card-border: rgba(255, 255, 255, 0.08);
}

[data-theme="light"] {
  /* AI RESTO Premium SaaS Light Mode Overrides */
  --ap-sidebar-bg: #ffffff; 
  --ap-sidebar-hover: rgba(124, 58, 237, 0.08);
  --ap-header-bg: rgba(255, 255, 255, 0.8);
  --ap-main-bg: #f8fafc;
  --ap-accent-color: #7c3aed; 
  --ap-accent-glow: rgba(124, 58, 237, 0.4);
  --ap-success: #059669; 
  --ap-text-main: #0f172a;
  --ap-text-dim: #475569; 
  --ap-text-muted: #64748b; 
  --ap-glass-bg: rgba(255, 255, 255, 0.6); 
  --ap-glass-border: rgba(15, 23, 42, 0.08);
  --ap-card-bg: rgba(255, 255, 255, 0.9);

  --accent-color: #7c3aed;
  --glass-bg: rgba(255, 255, 255, 0.6);
  --glass-border: rgba(15, 23, 42, 0.08);
  --premium-shadow: 0 8px 30px rgba(15, 23, 42, 0.1);
  
  --card-bg: #ffffff;
  --card-border: rgba(15, 23, 42, 0.08);
}`
);

// 2. Remove hardcoded rgba backgrounds from my recent additions at the bottom of the file
css = css.replace(/background:\s*rgba\(24, 24, 27, 0\.6\)\s*!important;/g, "background: var(--ap-glass-bg) !important;");
css = css.replace(/background:\s*rgba\(24, 24, 27, 0\.4\)\s*!important;/g, "background: var(--ap-card-bg) !important;");
css = css.replace(/background:\s*rgba\(255,255,255,0\.02\)\s*!important;/g, "background: var(--ap-glass-bg) !important;");
css = css.replace(/background:\s*rgba\(255,255,255,0\.03\)\s*!important;/g, "background: var(--ap-glass-bg) !important;");
css = css.replace(/color:\s*#fff\s*!important;/g, "color: var(--ap-text-main) !important;");

// Update input/select text color
css = css.replace(/select,\s*input\.glass-input\s*\{[\s\S]*?color:\s*var\(--ap-text-main\)\s*!important;/g, 
  "select, input.glass-input {\n  background: var(--ap-glass-bg) !important;\n  border: 1px solid var(--ap-glass-border) !important;\n  color: var(--ap-text-main) !important;"
);

// Fix nav-item hover texts for light mode
css = css.replace(/\.nav-item:hover\s*\{[\s\S]*?background:\s*rgba\(255,255,255,0\.03\)\s*!important;\s*\}/g,
  ".nav-item:hover {\n  transform: translateX(4px);\n  background: var(--ap-sidebar-hover) !important;\n}"
);

// Update nav-item active color
css = css.replace(/color:\s*#c4b5fd\s*!important;/g, "color: var(--ap-accent-color) !important;");

// Restore logo gradient for light mode readability
css = css.replace(/background:\s*linear-gradient\(135deg, #fff, #b794f4\)\s*!important;/g, "background: linear-gradient(135deg, var(--ap-text-main), var(--ap-accent-color)) !important;");

fs.writeFileSync(cssPath, css);
console.log('Fixed Light Mode variables and dynamic theming in AdminPanel.css');
