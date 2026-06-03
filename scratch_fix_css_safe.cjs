const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'AdminPanel.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace the variable mappings with Hardcoded Premium SaaS Colors
css = css.replace(
    /:root,[\s\S]*?--premium-shadow:\s*var\(--shadow-premium\);\s*\}/,
    `:root,
[data-theme="light"],
[data-theme="dark"] {
  /* AI RESTO Premium SaaS Dark Mode Overrides */
  --ap-sidebar-bg: #09090b; /* Matte Black */
  --ap-sidebar-hover: rgba(124, 58, 237, 0.15);
  --ap-header-bg: rgba(9, 9, 11, 0.8);
  --ap-main-bg: #050508; /* Deepest Matte Black */
  --ap-accent-color: #8b5cf6; /* Electric Purple */
  --ap-accent-glow: rgba(139, 92, 246, 0.5);
  --ap-success: #10b981; /* Emerald */
  --ap-text-main: #ffffff;
  --ap-text-dim: #a1a1aa; /* Zinc 400 */
  --ap-text-muted: #71717a; /* Zinc 500 */
  --ap-glass-bg: rgba(24, 24, 27, 0.6); /* Zinc 900 */
  --ap-glass-border: rgba(255, 255, 255, 0.08);

  --accent-color: #8b5cf6;
  --glass-bg: rgba(24, 24, 27, 0.6);
  --glass-border: rgba(255, 255, 255, 0.08);
  --premium-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  
  --card-bg: #09090b;
  --card-border: rgba(255, 255, 255, 0.08);
}`
);

// Inject futuristic Font mapping
css = css.replace(
    /\/\* AI RESTO.*? \*\//,
    `/* AI RESTO - Admin Panel Design System */
@import url('https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&f[]=general-sans@600,500,400&display=swap');`
);

css = css.replace(/font-family:\s*'Outfit'.*?;/g, "font-family: 'Satoshi', 'General Sans', system-ui, sans-serif;");

// Update .admin-layout to ensure dark background
css = css.replace(
    /\.admin-layout\s*\{[\s\S]*?\}/,
    `.admin-layout {
  display: flex !important;
  position: fixed;
  inset: 0;
  background: var(--ap-main-bg) !important;
  color: var(--ap-text-main) !important;
  font-family: 'Satoshi', 'General Sans', system-ui, sans-serif;
  overflow: hidden;
  z-index: 9999;
}`
);

// Upgrade Button Gradients
css = css.replace(
    /\.btn-primary\s*\{[\s\S]*?\}/,
    `.btn-primary {
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%) !important;
  color: #fff !important;
  border: none;
  font-weight: 600;
  border-radius: 12px;
  padding: 12px 24px;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3) !important;
  transition: all 0.3s ease;
  cursor: pointer;
}`
);

fs.writeFileSync(cssPath, css);
console.log('Restored and upgraded AdminPanel.css variables safely');
