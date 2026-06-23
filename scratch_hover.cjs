const fs = require('fs');
fs.appendFileSync('src/components/AdminPanel.css', `
.hover-row:hover {
  background: rgba(255,255,255,0.02) !important;
}
`);
