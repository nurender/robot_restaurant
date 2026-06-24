import { Bike, Edit2, Trash2, Plus } from 'lucide-react';
import React from 'react';
import apiService from '../../../services/apiService';
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
          <h1 className="view-title ext-cls-46d76c78" >Rider Fleet</h1>
          <p className="text-muted ext-cls-a6a615ae" >Manage your delivery force and real-time logistics.</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingRiderId(null); setNewRider({ name: '', phone: '', status: 'online' }); setShowRiderPopup(true); }}>
          <Plus size={20} />
          <span>Recruit Rider</span>
        </button>
      </div>

      <div className="inventory-grid">
        {riders.map(rider => (
          <div key={rider.id} className="glass-panel ext-cls-573aa7e3" >
            <div  className="ext-cls-84dd141c">
              <Bike size={32} className="text-accent" />
              <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', background: rider.status === 'online' ? 'var(--success)' : rider.status === 'busy' ? 'var(--warning)' : 'var(--text-muted)', border: '3px solid var(--card-bg)' }} />
            </div>
            <div  className="ext-cls-04a898f1">
              <div  className="ext-cls-06cbdd52">{rider.name}</div>
              <div  className="ext-cls-38a376ac">{rider.phone}</div>
              <div
                onClick={() => {
                  const nextStatus = rider.status === 'online' ? 'offline' : 'online';
                  apiService.updateRider(rider.id, { ...rider, status: nextStatus }).then(() => fetchData());
                }}
                className="status-pill clickable-status ${rider.status === 'online' ? 'active' : 'inactive'} st-cls-d5067dc7"
                
              >
                <div className="status-dot" style={{
                  width: '6px', height: '6px', borderRadius: '50%', marginRight: '6px',
                  background: rider.status === 'online' ? '#22c55e' : '#ef4444'
                }} />
                {rider.status.toUpperCase()}
              </div>
            </div>
            <div  className="ext-cls-3643ba81">
              <button
                className="inv-btn-edit st-cls-452044ba"
                onClick={() => handleEditRider(rider)}
                
              >
                <Edit2 size={18} />
              </button>
              <button
                className="inv-btn-delete st-cls-0b1f8344"
                onClick={() => handleDeleteRider(rider.id)}
                
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {riders.length === 0 && (
          <div  className="ext-cls-5cf40e0e">
            <Bike size={48}  className="ext-cls-e9f26b15" />
            <p>No riders in your fleet. Recruit your first rider to enable delivery.</p>
          </div>
        )}
      </div>
    </div>
  );
}
