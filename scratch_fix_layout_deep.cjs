const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'AdminPanel.css');
let css = fs.readFileSync(cssPath, 'utf8');

css += `
/* =========================================
   KANBAN AND FILTER BAR HOTFIX
   ========================================= */

/* Fix the Filter Bar internal alignment */
.orders-filter-bar {
  padding: 8px 12px 8px 24px !important;
  gap: 20px !important;
  align-items: center !important;
}
.filter-group {
  display: flex !important;
  flex-direction: row !important; /* Force inline */
  align-items: center !important;
  gap: 8px !important;
  padding: 6px 12px !important;
  background: var(--ap-sidebar-hover) !important;
  border-radius: 20px !important;
  border: 1px solid var(--ap-glass-border) !important;
}
.filter-group label {
  font-size: 11px !important;
  margin-bottom: 0 !important;
  margin-top: 0 !important;
}
.orders-filter-bar input, .orders-filter-bar select {
  width: auto !important;
  min-width: 90px !important;
  font-size: 13px !important;
  border-bottom: none !important;
  padding: 0 !important;
}
.orders-filter-bar input:focus, .orders-filter-bar select:focus {
  border-bottom: none !important;
}

/* Fix Kanban Columns Header Design */
.kanban-board {
  gap: 20px !important;
  padding-bottom: 20px !important;
}
.kanban-column {
  background: var(--ap-glass-bg) !important;
  border: 1px solid var(--ap-glass-border) !important;
  border-radius: 20px !important;
  padding: 16px !important;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02) !important;
}
.column-header {
  border-bottom: 1px solid var(--ap-glass-border) !important;
  padding-bottom: 12px !important;
  margin-bottom: 16px !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}
.column-header h2 {
  font-size: 12px !important;
  font-weight: 800 !important;
  letter-spacing: 1px !important;
  margin: 0 !important;
}
.column-header .count-badge {
  background: var(--ap-sidebar-hover) !important;
  color: var(--ap-accent-color) !important;
  font-weight: 800 !important;
  border-radius: 50% !important;
  width: 24px !important;
  height: 24px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 11px !important;
}

/* Fix Topbar Search box */
.header-search {
  border-radius: 40px !important;
  padding: 12px 20px !important;
  min-width: 350px !important;
  background: var(--ap-glass-bg) !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02) !important;
}
.header-search input {
  font-size: 13px !important;
}
`;

fs.writeFileSync(cssPath, css);
console.log('Applied Kanban and Filter fixes');
