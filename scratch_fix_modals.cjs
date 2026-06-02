const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'RobotChat.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace dark hardcoded RGBA backgrounds for modals with --card-bg
css = css.replace(/background:\s*rgba\(20,\s*20,\s*30,\s*0\.85\);?/g, 'background: var(--card-bg);');
css = css.replace(/background:\s*rgba\(23,\s*23,\s*33,\s*0\.95\);?/g, 'background: var(--card-bg);');
css = css.replace(/background:\s*rgba\(23,\s*23,\s*26,\s*0\.9\);?/g, 'background: var(--card-bg);');

fs.writeFileSync(cssPath, css);
console.log('Fixed Modal Backgrounds');
