import { Plus, Check } from 'lucide-react';
import React from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';

export default function RoleEditorModal({
  isOpen,
  onClose,
  currentRoleData,
  setCurrentRoleData,
  onSaveSuccess
}) {
  if (!isOpen) return null;

  const handleSave = async () => {
    if (!currentRoleData.name) return alert("Role name is required");
    try {
      await axios.post(`${API_URL}/api/mgmt/roles`, currentRoleData);
      const res = await axios.get(`${API_URL}/api/mgmt/roles`);
      onSaveSuccess(res.data.data);
      onClose();
    } catch (e) {
      alert("Failed to save role");
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'hidden', background: 'var(--card-bg)', borderRadius: '32px', border: '1px solid var(--card-border)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '40px 40px 20px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>{currentRoleData.id ? 'Edit Access Role' : 'Initialize New Role'}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Modify the security parameters and permitted system modules.</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'var(--bg-deep)', border: 'none', color: 'var(--text-main)', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
          </button>
        </div>

        <div style={{ padding: '30px 40px', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '10px', fontWeight: '800', letterSpacing: '1px' }}>ROLE IDENTIFIER</label>
            <input
              type="text"
              value={currentRoleData.name}
              onChange={(e) => setCurrentRoleData({ ...currentRoleData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              placeholder="e.g. store_manager"
              style={{ width: '100%', padding: '16px 20px', borderRadius: '14px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', outline: 'none', fontSize: '16px', fontWeight: '600' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '15px', fontWeight: '800', letterSpacing: '1px' }}>ACCESS MATRIX</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px' }}>
              {[
                'dashboard', 'orders', 'kitchen', 'marketing', 'menu', 'menu_order',
                'sidebar_order', 'coupons', 'customers', 'rider_fleet', 'inventory', 'reports', 'qr_codes',
                'feedback', 'settings', 'staff', 'restaurants', 'roles'
              ].map(mod => {
                const isSelected = currentRoleData.permissions.includes(mod);
                return (
                  <div
                    key={mod}
                    onClick={() => {
                      let newPerms = [...currentRoleData.permissions];
                      if (isSelected) newPerms = newPerms.filter(p => p !== mod);
                      else newPerms.push(mod);
                      setCurrentRoleData({ ...currentRoleData, permissions: newPerms });
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px',
                      background: isSelected ? 'rgba(124, 58, 237, 0.15)' : 'var(--bg-deep)',
                      borderRadius: '16px', cursor: 'pointer', border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ width: '18px', height: '18px', borderRadius: '5px', border: '2px solid', borderColor: isSelected ? 'var(--accent-primary)' : 'var(--card-border)', background: isSelected ? 'var(--accent-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isSelected && <Check size={12} color="#fff" strokeWidth={4} />}
                    </div>
                    <span style={{ fontSize: '14px', color: isSelected ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: '700', textTransform: 'capitalize' }}>{(mod || '').replace('_', ' ')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ padding: '30px 40px', borderTop: '1px solid var(--border-default)', display: 'flex', gap: '16px', background: 'var(--bg-secondary)' }}>
          <button
            className="btn-global-outline"
            onClick={onClose}
            
          >
            Discard
          </button>
          <button
            className="btn-global-primary"
            onClick={handleSave}
            
          >
            Confirm & Deploy
          </button>
        </div>
      </div>
    </div>
  );
}
