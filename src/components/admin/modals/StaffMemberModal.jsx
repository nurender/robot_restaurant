import { EyeOff, Eye } from 'lucide-react';
import React, { useState } from 'react';

export default function StaffMemberModal({
  isOpen,
  onClose,
  newStaff,
  setNewStaff,
  handleAddStaff,
  editingStaffId,
  restaurantsList,
  isLoading
}) {
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '500px', width: '90%', padding: '32px', borderRadius: '24px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-xl)' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>{editingStaffId ? 'Edit Neural Member' : 'Recruit New Member'}</h3>
        <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>Onboard elite operators to manage branch endpoints.</p>

        <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Full Name *</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              required
              style={{ width: '100%', height: '48px', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Email Address *</label>
            <input
              type="email"
              placeholder="e.g. john@swiggy.com"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              required
              style={{ width: '100%', height: '48px', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Secure Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showStaffPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newStaff.password}
                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                required
                style={{ width: '100%', height: '48px', padding: '12px 48px 12px 16px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowStaffPassword(!showStaffPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {showStaffPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Operational Role *</label>
            <select
              value={newStaff.role}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              style={{ width: '100%', height: '48px', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="admin">Branch Admin</option>
              <option value="super_admin">Master Admin</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Assign to Restaurant *</label>
            <select
              value={newStaff.restaurant_id || ''}
              onChange={(e) => setNewStaff({ ...newStaff, restaurant_id: e.target.value || null })}
              style={{ width: '100%', height: '48px', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">No Specific Restaurant (Global)</option>
              {restaurantsList.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.city})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn-global-outline"
              onClick={onClose}
              
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-global-primary"
              disabled={isLoading}
              
            >
              {isLoading ? <div className="spinner-small" /> : 'Save Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
