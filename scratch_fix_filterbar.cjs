const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'AdminPanel.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Upgrade the alignment of view headers 
css = css.replace(
    /\.view-header-row\s*\{[\s\S]*?\}/,
    `.view-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center; /* Adjusted from flex-start to center for better SaaS balance */
  margin-bottom: 32px;
  gap: 20px;
  flex-wrap: wrap;
}`
);

// Add styling for .orders-filter-bar that mimics a sleek Linear/Stripe component
css += `
/* =========================================
   SaaS Filter Bar Overrides 
   ========================================= */
.orders-filter-bar {
  background: var(--ap-card-bg) !important;
  border: 1px solid var(--ap-glass-border) !important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03) !important;
  backdrop-filter: blur(20px) !important;
  border-radius: 100px !important; /* Fully rounded pill shape */
  padding: 10px 14px 10px 24px !important;
  display: flex !important;
  align-items: center !important;
  gap: 24px !important;
}

/* Specific styling for the inputs inside the filter bar to make them blend in */
.orders-filter-bar .filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.orders-filter-bar .filter-group label {
  font-size: 9px !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--ap-text-muted);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}
.orders-filter-bar input, .orders-filter-bar select {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  color: var(--ap-text-main) !important;
  width: 120px !important;
  border-radius: 0 !important;
}
.orders-filter-bar input:focus, .orders-filter-bar select:focus {
  outline: none !important;
  border-bottom: 1px solid var(--ap-accent-color) !important;
  box-shadow: none !important;
}

/* Adjust the Matches badge */
.orders-filter-bar .matches-badge {
  background: var(--ap-sidebar-hover) !important;
  color: var(--ap-accent-color) !important;
  padding: 6px 12px !important;
  border-radius: 20px !important;
  font-weight: 800 !important;
  font-size: 12px !important;
  border: 1px solid var(--ap-glass-border) !important;
}

/* Make sure the New Order button looks integrated */
.orders-filter-bar .btn-primary {
  padding: 10px 20px !important;
  border-radius: 40px !important;
  font-size: 13px !important;
  margin-left: 10px !important;
}
`;

fs.writeFileSync(cssPath, css);
console.log('Upgraded Order Filter Bar Design for Premium SaaS feel');
