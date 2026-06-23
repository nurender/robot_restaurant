import { Bike, Edit2, Trash2, Plus } from 'lucide-react';
import React from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';

export default function RiderFleetView({
  riders,
  setEditingRiderId,
  setNewRider,
  setShowRiderPopup,
  fetchData,
  handleEditRider,
  handleDeleteRider
}) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8">
        <div className="header-left">
          <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Rider Fleet</h1>
          <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Manage your delivery force and real-time logistics.</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingRiderId(null); setNewRider({ name: '', phone: '', status: 'online' }); setShowRiderPopup(true); }}>
          <Plus size={20} />
          <span>Recruit Rider</span>
        </button>
      </div>

      <div className="inventory-grid">
        {riders.map(rider => (
          <div key={rider.id} className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Bike size={32} className="text-accent" />
              <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', background: rider.status === 'online' ? 'var(--success)' : rider.status === 'busy' ? 'var(--warning)' : 'var(--text-muted)', border: '3px solid var(--card-bg)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>{rider.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '2px' }}>{rider.phone}</div>
              <div
                onClick={() => {
                  const nextStatus = rider.status === 'online' ? 'offline' : 'online';
                  axios.put(`${API_URL}/api/mgmt/riders/${rider.id}`, { ...rider, status: nextStatus }).then(() => fetchData());
                }}
                className={`status-pill clickable-status ${rider.status === 'online' ? 'active' : 'inactive'}`}
                style={{ cursor: 'pointer', fontSize: '10px', padding: '4px 10px', display: 'inline-flex', marginTop: '8px', alignItems: 'center' }}
              >
                <div className="status-dot" style={{
                  width: '6px', height: '6px', borderRadius: '50%', marginRight: '6px',
                  background: rider.status === 'online' ? '#22c55e' : '#ef4444'
                }} />
                {rider.status.toUpperCase()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="inv-btn-edit"
                onClick={() => handleEditRider(rider)}
                style={{ background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-primary)', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex' }}
              >
                <Edit2 size={18} />
              </button>
              <button
                className="inv-btn-delete"
                onClick={() => handleDeleteRider(rider.id)}
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex' }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {riders.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bike size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <p>No riders in your fleet. Recruit your first rider to enable delivery.</p>
          </div>
        )}
      </div>
    </div>
  );
}
