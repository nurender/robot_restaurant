import React from 'react';

export default function SystemSettingsView({ adminUser }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>System Configurations</h1>
      <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Communication protocols settings.</p>

      <div className="glass-panel mt-8" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '28px', borderRadius: '24px', boxShadow: 'var(--shadow-md)', maxWidth: '600px' }}>
        <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Profile Verification</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Administrator Name</label>
            <input type="text" value={adminUser.name || ''} readOnly style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--bg-deep)', color: 'var(--text-main)', fontWeight: '600', marginTop: '6px' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Designated Role</label>
            <input type="text" value={adminUser.role || ''} readOnly style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--bg-deep)', color: 'var(--text-main)', fontWeight: '600', marginTop: '6px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
