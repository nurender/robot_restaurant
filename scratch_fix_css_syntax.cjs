const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'RobotChat.css');
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/var\(--text-main\);fff;?/gi, 'var(--text-main);');
css = css.replace(/var\(--text-main\);ffffff;?/gi, 'var(--text-main);');
// also fix any leftover fff 
css = css.replace(/color:\s*var\(--text-main\);(fff|ffffff)[^;]*;/gi, 'color: var(--text-main);');

fs.writeFileSync(cssPath, css);
console.log('Fixed CSS syntax error');
