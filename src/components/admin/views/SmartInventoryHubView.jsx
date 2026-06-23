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
        <div  className="ext-cls-78e7532f">
          <button className="btn-global-primary" >
            <Plus size={18} /> Add Stock
          </button>
        </div>
      </div>

      <div className="glass-panel mb-8 ext-cls-72fc3d67" >
        <h3  className="ext-cls-c456c5db">
          <Bot size={20} className="text-accent" /> AI Stock Forecast
        </h3>
        <div  className="ext-cls-0fa2f318">
          {[
            { item: 'Burger Buns', status: 'CRITICAL', days: '2 Days Left', color: 'var(--error)' },
            { item: 'Chicken Breast', status: 'STABLE', days: '8 Days Left', color: 'var(--success)' },
            { item: 'Coffee Beans', status: 'WARNING', days: '4 Days Left', color: 'var(--warning)' }
          ].map((f, i) => (
            <div key={i}  className="ext-cls-4bc33aa8">
              <div  className="ext-cls-0692cb42">{f.item}</div>
              <div  className="ext-cls-1bdb758b">
                <span  className="ext-cls-1406a30b">{f.status}</span>
                <span  className="ext-cls-76847ffc">{f.days}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
