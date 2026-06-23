import { Edit, Trash2, Plus } from 'lucide-react';
import React from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import RoleEditorModal from '../modals/RoleEditorModal';

export default function RolesManagementView({ dbRoles, setDbRoles, currentRoleData, setCurrentRoleData, isRoleModalOpen, setIsRoleModalOpen }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div className="header-left">
          <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Role Management</h1>
          <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Configure system-wide administrative privileges and module access.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setCurrentRoleData({ name: '', permissions: [] });
            setIsRoleModalOpen(true);
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '14px',
            background: 'var(--accent-primary)', border: 'none', color: '#fff', fontWeight: '700', cursor: 'pointer'
          }}
        >
          <Plus size={20} /> Add New Role
        </button>
      </div>

      <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'var(--bg-deep)' }}>
              <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>IDENTITY / ROLE NAME</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>ACCESS SCOPE</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>MODULES</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'right' }}>CONTROL</th>
            </tr>
          </thead>
          <tbody>
            {dbRoles.map((role) => (
              <tr key={role.id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.2s' }} className="table-row-hover">
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: role.name === 'super_admin' ? '#10b981' : 'var(--accent-primary)' }} />
                    <span style={{ fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{(role.name || '').replace('_', ' ')}</span>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                    {role.permissions.length} Active Modules
                  </span>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '400px' }}>
                    {role.permissions.slice(0, 4).map(p => (
                      <span key={p} style={{ fontSize: '11px', background: 'var(--bg-deep)', padding: '3px 10px', borderRadius: '6px', color: 'var(--text-main)', border: '1px solid var(--card-border)' }}>{(p || '').replace('_', ' ')}</span>
                    ))}
                    {role.permissions.length > 4 && <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '3px' }}>+{role.permissions.length - 4} more</span>}
                  </div>
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setCurrentRoleData(role);
                        setIsRoleModalOpen(true);
                      }}
                      style={{
                        background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.2)',
                        color: '#a78bfa', cursor: 'pointer', padding: '10px 18px', borderRadius: '12px',
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px'
                      }}
                    >
                      <Edit size={16} /> Edit Role
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Delete role ${role.name}?`)) {
                          await axios.delete(`${API_URL}/api/mgmt/roles/${role.id}`);
                          axios.get(`${API_URL}/api/mgmt/roles`).then(res => setDbRoles(res.data.data));
                        }
                      }}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '10px', borderRadius: '12px', transition: 'all 0.2s' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RoleEditorModal 
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentRoleData={currentRoleData}
        setCurrentRoleData={setCurrentRoleData}
        onSaveSuccess={(roles) => setDbRoles(roles)}
      />
    </div>
  );
}
