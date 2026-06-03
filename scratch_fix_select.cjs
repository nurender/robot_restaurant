const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'AdminPanel.css');
let css = fs.readFileSync(cssPath, 'utf8');

css += `
/* =========================================
   CUSTOM SAAS DROPDOWN (SELECT) FIX
   ========================================= */

/* Hide default browser arrow and use custom sleek SVG Arrow */
.orders-filter-bar select, .glass-input select, select {
  appearance: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='gray' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
  background-repeat: no-repeat !important;
  background-position: right 6px center !important;
  background-size: 14px !important;
  padding-right: 28px !important;
  cursor: pointer !important;
}

/* Style the internal options list */
select option {
  background: var(--ap-bg-panel) !important;
  color: var(--ap-text-main) !important;
  padding: 12px !important;
  font-size: 14px !important;
  font-family: 'Satoshi', sans-serif !important;
}
`;

fs.writeFileSync(cssPath, css);
console.log('Appended custom dropdown/select styles');
