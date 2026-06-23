const fs = require('fs');

const css = `
.btn-global-primary-sm {
  background: linear-gradient(135deg, var(--accent-color), #818cf8);
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--accent-glow);
  white-space: nowrap;
}
.btn-global-primary-sm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--accent-glow);
  filter: brightness(1.1);
}

.btn-global-danger-sm {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
  border: 1px solid var(--error);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}
.btn-global-danger-sm:hover {
  background: var(--error);
  color: #fff;
}

.btn-global-icon-sm {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--card-border);
  color: var(--text-dim);
  padding: 6px 10px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-global-icon-sm:hover {
  background: rgba(255,255,255,0.1);
  color: white;
  border-color: var(--accent-primary);
}
`;

fs.appendFileSync('src/components/AdminPanel.css', css);
