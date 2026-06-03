const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'AdminPanel.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace standard #ffffff backgrounds and borders that break Dark Mode
css = css.replace(/background:\s*#ffffff;/g, "background: var(--ap-glass-bg);");
css = css.replace(/border:\s*1px solid #e2e8f0;/g, "border: 1px solid var(--ap-glass-border);");
css = css.replace(/border:\s*1px solid #d1d9e5;/g, "border: 1px solid var(--ap-glass-border);");
css = css.replace(/color:\s*#64748b\s*!important;/g, "color: var(--ap-text-dim) !important;");

// Search for any other #e2e8f0 or #f1f5f9 that were missed in AdminPanel.css
css = css.replace(/border-color:\s*#e2e8f0;/g, "border-color: var(--ap-glass-border);");
css = css.replace(/border-bottom:\s*1px solid #e2e8f0;/g, "border-bottom: 1px solid var(--ap-glass-border);");
css = css.replace(/background:\s*#f1f5f9;/g, "background: var(--ap-sidebar-hover);");
css = css.replace(/background:\s*#fff;/g, "background: var(--ap-glass-bg);");
css = css.replace(/background-color:\s*#ffffff;/g, "background-color: var(--ap-glass-bg);");
css = css.replace(/background-color:\s*#fff;/g, "background-color: var(--ap-glass-bg);");

fs.writeFileSync(cssPath, css);
console.log('Fixed legacy hardcoded white colors for Dark Mode safety in AdminPanel.css');

// Let's also check RobotChat.css for similar generic white backgrounds that might break dark mode (like the secondary buttons)
const chatCssPath = path.join(__dirname, 'src', 'components', 'RobotChat.css');
if (fs.existsSync(chatCssPath)) {
    let chatCss = fs.readFileSync(chatCssPath, 'utf8');
    
    // Fix .btn-secondary which was highlighted in earlier scans
    chatCss = chatCss.replace(/\.btn-secondary\s*\{[\s\S]*?background:\s*#ffffff;/g, (match) => {
        return match.replace(/background:\s*#ffffff;/, 'background: var(--bg-secondary);');
    });
    chatCss = chatCss.replace(/\.btn-secondary\s*\{[\s\S]*?color:\s*#0f172a;/g, (match) => {
        return match.replace(/color:\s*#0f172a;/, 'color: var(--text-main);');
    });
    
    // Fix generic White popup menus or headers
    chatCss = chatCss.replace(/background:\s*#ffffff;/g, "background: var(--bg-tertiary);");
    chatCss = chatCss.replace(/background:\s*#fff;/g, "background: var(--bg-tertiary);");

    fs.writeFileSync(chatCssPath, chatCss);
    console.log('Fixed legacy hardcoded white colors in RobotChat.css');
}
