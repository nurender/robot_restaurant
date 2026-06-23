const fs = require('fs');

const globalCss = `
/* === AUTOMATED GLOBAL LAYOUT UTILITIES === */
.view-container-deep {
  padding: 32px !important;
  background: var(--bg-deep) !important;
  min-height: 100vh !important;
}

.glass-panel-styled {
  background: var(--card-bg) !important;
  border: 1px solid var(--card-border) !important;
  border-radius: 24px !important;
  overflow: hidden !important;
}

.glass-panel-padded {
  background: var(--card-bg) !important;
  border: 1px solid var(--card-border) !important;
  border-radius: 24px !important;
  padding: 32px !important;
}

.table-styled {
  width: 100% !important;
  border-collapse: collapse !important;
}
.table-header-row {
  border-bottom: 1px solid var(--card-border) !important;
  color: var(--text-muted) !important;
  font-size: 12px !important;
  text-align: left !important;
}
.table-body-row {
  border-bottom: 1px solid var(--card-border) !important;
  color: var(--text-main) !important;
  transition: background 0.2s !important;
}
`;

fs.appendFileSync('src/components/AdminPanel.css', globalCss);
