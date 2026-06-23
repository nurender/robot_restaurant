const fs = require('fs');
const path = require('path');

const cssReplacePatterns = [
  {
    // The main view container wrapper
    regex: /className="view-container animate-slide-up"\s+style=\{\{\s*padding:\s*'32px',\s*background:\s*'var\(--bg-deep\)',\s*minHeight:\s*'100vh'\s*\}\}/g,
    replace: 'className="view-container animate-slide-up view-container-deep"'
  },
  {
    // The standard glass-panel table wrapper
    regex: /className="glass-panel"\s+style=\{\{\s*background:\s*'var\(--card-bg\)',\s*border:\s*'1px solid var\(--card-border\)',\s*borderRadius:\s*'24px',\s*overflow:\s*'hidden'\s*\}\}/g,
    replace: 'className="glass-panel glass-panel-styled"'
  },
  {
    // The padded glass-panel wrapper
    regex: /className="glass-panel"\s+style=\{\{\s*padding:\s*'32px',\s*background:\s*'var\(--card-bg\)',\s*border:\s*'1px solid var\(--card-border\)',\s*borderRadius:\s*'24px'\s*\}\}/g,
    replace: 'className="glass-panel glass-panel-padded"'
  },
  {
    // Common table styles
    regex: /style=\{\{\s*width:\s*'100%',\s*borderCollapse:\s*'collapse'\s*\}\}/g,
    replace: 'className="table-styled"'
  },
  {
    // Common table header row styles
    regex: /style=\{\{\s*borderBottom:\s*'1px solid var\(--card-border\)',\s*color:\s*'var\(--text-muted\)',\s*fontSize:\s*'12px',\s*textAlign:\s*'left'\s*\}\}/g,
    replace: 'className="table-header-row"'
  },
  {
    // Common table body row styles with hover events
    regex: /style=\{\{\s*borderBottom:\s*'1px solid var\(--card-border\)',\s*color:\s*'var\(--text-main\)',\s*transition:\s*'background 0\.2s'\s*\}\}\s+onMouseOver=\{\(e\)\s*=>\s*e\.currentTarget\.style\.background\s*=\s*'rgba\(255,255,255,0\.02\)'\}\s+onMouseLeave=\{\(e\)\s*=>\s*e\.currentTarget\.style\.background\s*=\s*'transparent'\}/g,
    replace: 'className="table-body-row hover-row"'
  }
];

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walkDir(file));
    } else { 
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walkDir('src/components/admin');
let filesChanged = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  cssReplacePatterns.forEach(pattern => {
    content = content.replace(pattern.regex, pattern.replace);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Refactored inline layout styles in ${file}`);
    filesChanged++;
  }
});

console.log(`Total files layout refactored: ${filesChanged}`);
