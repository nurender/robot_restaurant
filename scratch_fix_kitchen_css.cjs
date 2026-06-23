const fs = require('fs');

const css = `
/* === KITCHEN SYSTEM MODAL / VIEW === */
.kitchen-column {
  min-width: 400px;
  flex: 1;
  background: var(--bg-deep);
  border: 1px solid var(--card-border);
  border-radius: 24px;
  padding: 20px;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.kitchen-order-card {
  padding: 24px;
  border-radius: 28px;
  border: 2px solid var(--card-border);
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.1);
}

.kitchen-alert-box {
  padding: 12px 16px;
  background: rgba(245, 158, 11, 0.1);
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #fcd34d;
}

.kitchen-btn-icon-soft {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--card-border);
  padding: 8px;
  border-radius: 10px;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.kitchen-btn-icon-soft:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}
`;

fs.appendFileSync('src/components/AdminPanel.css', css);
