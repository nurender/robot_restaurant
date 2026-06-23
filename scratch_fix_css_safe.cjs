const fs = require('fs');

const css = `
/* === MANUAL ORDER MODAL === */
.manual-order-modal {
  max-width: 1200px !important;
  width: 98% !important;
  padding: 0 !important;
  border-radius: 28px !important;
  overflow: hidden;
  display: flex !important;
  flex-direction: row !important;
  height: 92vh;
  background: var(--bg-deep) !important;
}

.manual-order-left {
  flex: 1.5;
  padding: 32px;
  border-right: 1px solid var(--card-border);
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: hidden;
}

.manual-order-search {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border-radius: 14px;
  background: var(--bg-primary);
  border: 1px solid var(--card-border);
  color: white;
}

.manual-order-card {
  padding: 16px;
  border-radius: 20px;
  background: var(--card-bg);
  border: 1.5px solid var(--card-border);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.manual-order-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-primary);
}

.manual-order-right {
  flex: 1;
  padding: 32px;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.manual-order-input {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  background: var(--bg-deep);
  border: 1px solid var(--card-border);
  color: white;
  margin-top: 4px;
}

.manual-order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-deep);
  padding: 12px;
  border-radius: 16px;
  border: 1px solid var(--card-border);
}
`;

fs.appendFileSync('src/components/AdminPanel.css', css);
