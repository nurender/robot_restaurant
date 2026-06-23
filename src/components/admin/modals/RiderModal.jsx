import React from 'react';

export default function RiderModal({
  isOpen,
  onClose,
  editingRiderId,
  newRider,
  setNewRider,
  handleSaveRider,
  isLoading
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '650px', width: '90%', padding: '32px', borderRadius: '32px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>{editingRiderId ? 'Update Rider Profile' : 'Recruit New Rider'}</h3>
            <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>Onboard delivery agents to your fleet network.</p>
          </div>
          {editingRiderId && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <label style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '4px' }}>CURRENT STATUS</label>
              <select
                value={newRider.status}
                onChange={(e) => setNewRider({ ...newRider, status: e.target.value })}
                style={{ padding: '6px 12px', borderRadius: '10px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '12px' }}
              >
                <option value="online">Online</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ gridColumn: 'span 1' }}>
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name *</label>
            <input type="text" placeholder="e.g. Rahul Kumar" value={newRider.name} onChange={(e) => setNewRider({ ...newRider, name: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '6px' }} />
          </div>
          <div style={{ gridColumn: 'span 1' }}>
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number *</label>
            <input type="text" placeholder="+91 XXXXX XXXXX" value={newRider.phone} onChange={(e) => setNewRider({ ...newRider, phone: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '6px' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vehicle Number</label>
            <input type="text" placeholder="e.g. DL 01 AB 1234" value={newRider.vehicle_number} onChange={(e) => setNewRider({ ...newRider, vehicle_number: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '6px' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>License Number</label>
            <input type="text" placeholder="e.g. DLXXXXXXXXXXXXX" value={newRider.license_number} onChange={(e) => setNewRider({ ...newRider, license_number: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '6px' }} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Residential Address</label>
            <textarea placeholder="Complete address..." value={newRider.address} onChange={(e) => setNewRider({ ...newRider, address: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '6px', minHeight: '60px' }} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Emergency Contact (Name/Phone)</label>
            <input type="text" placeholder="e.g. Brother: 98XXXXXXXX" value={newRider.emergency_contact} onChange={(e) => setNewRider({ ...newRider, emergency_contact: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '6px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--card-border)' }}>
          <button className="btn-global-outline" onClick={onClose} >Cancel</button>
          <button
            className="btn-global-primary"
            disabled={isLoading}
            onClick={handleSaveRider}
            
          >
            {isLoading ? <div className="spinner-small" /> : (editingRiderId ? 'Synchronize Profile' : 'Confirm Recruitment')}
          </button>
        </div>
      </div>
    </div>
  );
}
