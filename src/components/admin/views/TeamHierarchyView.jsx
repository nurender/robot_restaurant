import { Edit2, Trash2, Users, Sparkles, Store } from 'lucide-react';
import React from 'react';

export default function TeamHierarchyView({
  restaurantsList,
  staffList,
  setNewNode,
  setEditingNodeId,
  setShowNodePopup,
  deleteRestaurant,
  setNewStaff,
  setEditingStaffId,
  setShowStaffPopup,
  deleteUser,
  loadingStates
}) {
  return (
    <div className="view-container animate-slide-up">
      <div className="view-header-row">
        <div className="header-left">
          <h1 className="view-title">Team Hierarchy</h1>
          <p className="text-muted">Manage system access and personnel across your restaurant network.</p>
        </div>
      </div>

      {restaurantsList.map(resto => {
        const restoStaff = staffList.filter(s => s.restaurant_id === resto.id);
        return (
          <div key={resto.id} style={{ marginBottom: '44px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--card-border)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                <Store size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>{resto.name}</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{restoStaff.length} Members Assigned</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setNewNode({ ...resto });
                    setEditingNodeId(resto.id);
                    setShowNodePopup(true);
                  }}
                  style={{ background: 'none', border: '1px solid var(--card-border)', color: 'var(--text-dim)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit2 size={12} /> EDIT RESTO
                </button>
                <button
                  onClick={() => deleteRestaurant(resto.id)}
                  className="btn-global-icon danger"
                >
                  <Trash2 size={12} /> DELETE
                </button>
              </div>
            </div>
            <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead>
                  <tr style={{ textAlign: 'left', background: 'var(--bg-deep)' }}>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>NAME & EMAIL</th>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>SYSTEM ROLE</th>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'right' }}>CONTROL</th>
                  </tr>
                </thead>
                <tbody>
                  {restoStaff.length > 0 ? restoStaff.map(staff => (
                    <tr key={staff.id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14px' }}>{staff.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{staff.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span className={`role-badge ${staff.role} shadow-sm`}>{(staff.role || 'user').replace('_', ' ')}</span>
                      </td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setNewStaff({ ...staff });
                              setEditingStaffId(staff.id);
                              setShowStaffPopup(true);
                            }}
                            style={{
                              background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.2)',
                              color: '#a78bfa', cursor: 'pointer', padding: '8px 14px', borderRadius: '12px',
                              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '12px'
                            }}
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => deleteUser(staff.id)} disabled={loadingStates[`delete_user_${staff.id}`]}
                            className="btn-global-icon danger"
                          >
                            {loadingStates[`delete_user_${staff.id}`] ? <div className="spinner-small" style={{ borderTopColor: 'var(--error)' }} /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                        No members found in this restaurant.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Staff without restaurant (Global Admins) */}
      {(() => {
        const globalStaff = staffList.filter(s => !s.restaurant_id || !restaurantsList.find(r => r.id === s.restaurant_id));
        if (globalStaff.length === 0) return null;
        return (
          <div style={{ marginBottom: '44px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--card-border)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Global Administrators</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Unassigned or Master Accounts</p>
              </div>
            </div>
            <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead>
                  <tr style={{ textAlign: 'left', background: 'var(--bg-deep)' }}>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>NAME & EMAIL</th>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>SYSTEM ROLE</th>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'right' }}>CONTROL</th>
                  </tr>
                </thead>
                <tbody>
                  {globalStaff.map(staff => (
                    <tr key={staff.id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14px' }}>{staff.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{staff.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span className={`role-badge ${staff.role} shadow-sm`}>{(staff.role || 'user').replace('_', ' ')}</span>
                      </td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setNewStaff({ ...staff });
                              setEditingStaffId(staff.id);
                              setShowStaffPopup(true);
                            }}
                            style={{
                              background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.2)',
                              color: '#a78bfa', cursor: 'pointer', padding: '8px 14px', borderRadius: '12px',
                              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '12px'
                            }}
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => deleteUser(staff.id)} disabled={loadingStates[`delete_user_${staff.id}`]}
                            className="btn-global-icon danger"
                          >
                            {loadingStates[`delete_user_${staff.id}`] ? <div className="spinner-small" style={{ borderTopColor: 'var(--error)' }} /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
