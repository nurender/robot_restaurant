import { Plus, Store, Edit2, Trash2 } from 'lucide-react';

export default function RestaurantNetworkView({
  restaurantsList,
  staffList,
  setNewStaff,
  setShowStaffPopup,
  setNewNode,
  setEditingNodeId,
  setShowNodePopup,
  deleteRestaurant,
  loadingStates,
  newStaff
}) {
  return (
    <div className="view-container animate-slide-up">
      <div className="view-header-row">
        <div className="header-left">
          <h1 className="view-title">Restaurant Network</h1>
          <p className="text-muted">Overview of all active restaurants in the cluster.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNodePopup(true)}>
          <Plus size={20} />
          <span>Add New Restaurant</span>
        </button>
      </div>
      <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'var(--bg-deep)' }}>
              <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>RESTAURANT INFO</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>LOCATION & CODE</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>TEAM MEMBERS</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'right' }}>CONTROL</th>
            </tr>
          </thead>
          <tbody>
            {restaurantsList.length > 0 ? restaurantsList.map(res => {
              const nodeStaff = staffList.filter(s => s.restaurant_id === res.id);
              return (
                <tr key={res.id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Store size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '14px' }}>{res.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#22c55e', marginTop: '4px', fontWeight: '700', textTransform: 'uppercase' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} className="animate-pulse"></div> Active Live Sync
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--text-dim)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       {res.city || 'Active Restaurant'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{res.branch_code || 'ID: ' + res.id}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>{nodeStaff.length} Members</span>
                      <button onClick={() => {
                        setNewStaff({ ...newStaff, restaurant_id: res.id });
                        setShowStaffPopup(true);
                      }} style={{ background: 'rgba(124, 58, 237, 0.1)', border: 'none', color: 'var(--accent-primary)', borderRadius: '6px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Add Member">
                        <Plus size={14} />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setNewNode({ ...res });
                          setEditingNodeId(res.id);
                          setShowNodePopup(true);
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
                        onClick={() => deleteRestaurant(res.id)} disabled={loadingStates[`delete_restaurant_${res.id}`]}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: loadingStates[`delete_restaurant_${res.id}`] ? 'not-allowed' : 'pointer', padding: '8px', borderRadius: '12px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px' }}
                      >
                        {loadingStates[`delete_restaurant_${res.id}`] ? <div className="spinner-small" style={{ borderTopColor: 'var(--error)' }} /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                  No restaurants found in the network.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
