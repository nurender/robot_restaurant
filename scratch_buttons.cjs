const fs = require('fs');
const path = require('path');

const buttonPatterns = [
  {
    regex: /className="btn-primary"([^>]*)(style=\{\{[^}]+\}\})/g,
    replace: 'className="btn-global-primary"$1'
  },
  {
    regex: /style=\{\{\s*flex:\s*1,\s*padding:\s*'12px',\s*borderRadius:\s*'12px',\s*border:\s*'none',\s*background:\s*'linear-gradient[^']+',\s*color:\s*'white',\s*fontWeight:\s*'800',\s*cursor:\s*'pointer',\s*boxShadow:\s*'[^']+'\s*\}\}/g,
    replace: 'className="btn-global-primary" style={{ flex: 1 }}'
  },
  {
    regex: /style=\{\{\s*background:\s*'var\(--accent-primary\)15',\s*border:\s*'1px solid var\(--accent-primary\)40',\s*color:\s*'var\(--accent-primary\)',\s*padding:\s*'6px 14px',\s*borderRadius:\s*'10px',\s*fontSize:\s*'12px',\s*fontWeight:\s*'700',\s*cursor:\s*'pointer'\s*\}\}/g,
    replace: 'className="btn-global-outline"'
  },
  {
    regex: /className="inv-btn-edit"[\s\S]*?style=\{\{[\s\S]*?width:\s*'auto',\s*height:\s*'auto'\s*\}\}/g,
    replace: 'className="btn-global-outline"'
  },
  {
    regex: /className="inv-btn-edit"([^>]*)(style=\{\{[^}]+\}\})/g,
    replace: 'className="btn-global-outline"$1'
  },
  {
    regex: /style=\{\{\s*background:\s*'rgba\(239, 68, 68, 0\.1\)',\s*border:\s*'none',\s*color:\s*'#ef4444',\s*cursor:\s*'pointer',\s*padding:\s*'8px',\s*borderRadius:\s*'12px',\s*transition:\s*'all 0\.2s',\s*display:\s*'flex',\s*alignItems:\s*'center',\s*justifyContent:\s*'center',\s*width:\s*'34px',\s*height:\s*'34px'\s*\}\}/g,
    replace: 'className="btn-global-icon danger"'
  },
  {
    regex: /style=\{\{\s*background:\s*'rgba\(59, 130, 246, 0\.1\)',\s*border:\s*'none',\s*color:\s*'#3b82f6',\s*cursor:\s*'pointer',\s*padding:\s*'8px',\s*borderRadius:\s*'12px',\s*transition:\s*'all 0\.2s',\s*display:\s*'flex',\s*alignItems:\s*'center',\s*justifyContent:\s*'center',\s*width:\s*'34px',\s*height:\s*'34px'\s*\}\}/g,
    replace: 'className="btn-global-icon edit"'
  },
  {
    regex: /style=\{\{\s*background:\s*'none',\s*border:\s*'1px solid rgba\(239, 68, 68, 0\.2\)',\s*color:\s*'#ef4444',\s*padding:\s*'6px 12px',\s*borderRadius:\s*'8px',\s*fontSize:\s*'11px',\s*fontWeight:\s*'700',\s*cursor:\s*'pointer',\s*display:\s*'flex',\s*alignItems:\s*'center',\s*gap:\s*'6px'\s*\}\}/g,
    replace: 'className="btn-global-icon danger"'
  },
  {
    regex: /style=\{\{\s*background:\s*'rgba\(124, 58, 237, 0\.1\)',\s*border:\s*'1px solid rgba\(124, 58, 237, 0\.2\)',\s*color:\s*'var\(--accent-primary\)',\s*padding:\s*'8px 16px',\s*borderRadius:\s*'14px',\s*fontSize:\s*'13px',\s*fontWeight:\s*'800',\s*cursor:\s*'pointer',\s*display:\s*'flex',\s*alignItems:\s*'center',\s*justifyContent:\s*'center',\s*gap:\s*'8px',\s*transition:\s*'all 0\.2s'\s*\}\}/g,
    replace: 'className="btn-global-outline"'
  },
  {
    regex: /className="btn-secondary"([^>]*)(style=\{\{[^}]+\}\})/g,
    replace: 'className="btn-global-outline"$1'
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
      if (file.endsWith('.js') || file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walkDir('src/components/admin');
let filesChanged = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  buttonPatterns.forEach(pattern => {
    content = content.replace(pattern.regex, pattern.replace);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Refactored buttons in ${file}`);
    filesChanged++;
  }
});

console.log(`Total files refactored: ${filesChanged}`);
