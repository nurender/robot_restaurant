const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'AdminPanel.css');
let css = fs.readFileSync(cssPath, 'utf8');

css += `
/* =========================================
   AI RESTO OS FUTURISTIC SAAS OVERRIDES
   ========================================= */

/* GLOBAL SAAS FONT AND BACKGROUND */
.admin-layout, .admin-sidebar, .main-header, .view-container {
  background: var(--ap-main-bg) !important;
  font-family: 'Satoshi', 'General Sans', sans-serif !important;
}

/* SIDEBAR RE-STYLING */
.admin-sidebar {
  background: var(--ap-sidebar-bg) !important;
  border-right: 1px solid var(--ap-glass-border) !important;
  backdrop-filter: blur(20px);
}
.sidebar-logo {
  font-family: 'Satoshi', sans-serif !important;
  background: linear-gradient(135deg, #fff, #b794f4) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
}
.nav-item {
  border-radius: 12px !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
.nav-item:hover {
  transform: translateX(4px);
  background: rgba(255,255,255,0.03) !important;
}
.nav-item.active {
  background: rgba(139, 92, 246, 0.1) !important;
  border: 1px solid rgba(139, 92, 246, 0.2) !important;
  color: #c4b5fd !important;
}
.nav-item.active::before {
  content: ''; position: absolute; left: 0; top: 15%; height: 70%; width: 3px;
  background: #8b5cf6; border-radius: 0 4px 4px 0; box-shadow: 0 0 10px #8b5cf6;
}

/* TOP NAVBAR RE-STYLING */
.main-header {
  background: var(--ap-header-bg) !important;
  backdrop-filter: blur(20px) !important;
  border-bottom: 1px solid var(--ap-glass-border) !important;
}
.header-search {
  background: rgba(255,255,255,0.02) !important;
  border: 1px solid var(--ap-glass-border) !important;
  border-radius: 16px !important;
  transition: all 0.3s ease !important;
}
.header-search:focus-within {
  border-color: #8b5cf6 !important;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15) !important;
}

/* DASHBOARD CARDS (STAT CARDS) */
.stat-card-modern {
  background: rgba(24, 24, 27, 0.6) !important;
  border: 1px solid var(--ap-glass-border) !important;
  border-radius: 20px !important;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
  backdrop-filter: blur(10px);
}
.stat-card-modern:hover {
  transform: translateY(-5px);
  border-color: rgba(139, 92, 246, 0.3) !important;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.15) !important;
}

/* ORDER TRACKING CARDS */
.order-card, .kitchen-order-card {
  background: rgba(24, 24, 27, 0.4) !important;
  border: 1px solid var(--ap-glass-border) !important;
  border-radius: 24px !important;
  transition: all 0.4s ease !important;
}
.order-card:hover, .kitchen-order-card:hover {
  border-color: rgba(139, 92, 246, 0.2) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5) !important;
}

/* MENU INTELLIGENCE CARDS */
.inventory-card, .dish-card-premium {
  background: rgba(24, 24, 27, 0.6) !important;
  border: 1px solid var(--ap-glass-border) !important;
  border-radius: 24px !important;
  overflow: hidden !important;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
.inventory-card:hover, .dish-card-premium:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(139, 92, 246, 0.3) !important;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(139, 92, 246, 0.15) !important;
}

/* FILTER BARS & TABS */
.filter-section, .view-header-row {
  background: transparent !important;
  border: none !important;
}
select, input.glass-input {
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid var(--ap-glass-border) !important;
  color: #fff !important;
  border-radius: 12px !important;
}
select:focus, input.glass-input:focus {
  border-color: #8b5cf6 !important;
  outline: none !important;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15) !important;
}

/* CUSTOM SCROLLBAR FOR PREMIUM FEEL */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.5);
}
`;

fs.writeFileSync(cssPath, css);
console.log('Appended deep SaaS aesthetic overrides to AdminPanel.css');
