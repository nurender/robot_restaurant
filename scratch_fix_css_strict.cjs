const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'RobotChat.css');
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/white;fff/g, 'white');
css = css.replace(/var\(--text-main\);fff/g, 'var(--text-main)');
css = css.replace(/;fff/g, ';');

fs.writeFileSync(cssPath, css);
console.log('Fixed more CSS syntax errors');
