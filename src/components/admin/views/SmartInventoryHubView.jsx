import { Plus, Bot } from 'lucide-react';
import React from 'react';

export default function SmartInventoryHubView() {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8">
        <div className="header-left">
          <h1 className="view-title">Smart Inventory Hub</h1>
          <p className="text-muted">Real-time resource tracking and replenishment forecasting.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn-global-primary" >
            <Plus size={18} /> Add Stock
          </button>
        </div>
      </div>

      <div className="glass-panel mb-8" style={{ padding: '24px', borderRadius: '24px', border: '1.5px solid var(--accent-primary)', background: 'rgba(124, 58, 237, 0.05)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bot size={20} className="text-accent" /> AI Stock Forecast
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { item: 'Burger Buns', status: 'CRITICAL', days: '2 Days Left', color: 'var(--error)' },
            { item: 'Chicken Breast', status: 'STABLE', days: '8 Days Left', color: 'var(--success)' },
            { item: 'Coffee Beans', status: 'WARNING', days: '4 Days Left', color: 'var(--warning)' }
          ].map((f, i) => (
            <div key={i} style={{ padding: '16px', background: 'var(--bg-deep)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>{f.item}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: f.color }}>{f.status}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{f.days}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
