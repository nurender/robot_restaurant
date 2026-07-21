import { Plus, Store, Edit2, Trash2, ChevronDown, ChevronUp, Users } from 'lucide-react';
import React, { useState } from 'react';

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
  newStaff,
  setEditingStaffId,
  deleteUser
}) {
  const [expandedMap, setExpandedMap] = useState({});

  const toggleExpand = (id) => {
    setExpandedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
      <div className="glass-panel ext-cls-bdf67aa8" >
        <table  className="ext-cls-d8915f8c">
          <thead>
            <tr  className="ext-cls-063c6676">
              <th  className="ext-cls-980c8326">RESTAURANT INFO</th>
              <th  className="ext-cls-980c8326">LOCATION & CODE</th>
              <th  className="ext-cls-980c8326">TEAM MEMBERS</th>
              <th  className="ext-cls-a1f77236">CONTROL</th>
            </tr>
          </thead>
          <tbody>
            {restaurantsList.length > 0 ? restaurantsList.map(res => {
              const nodeStaff = staffList.filter(s => s.restaurant_id === res.id);
              const isExpanded = !!expandedMap[res.id];
              return (
                <React.Fragment key={res.id}>
                  <tr className={`table-row-hover ext-cls-f6070c60 ${isExpanded ? 'bg-white/5' : ''}`}>
                    <td  className="ext-cls-b65a50f4">
                      <div  className="ext-cls-b68c5feb">
                        <div  className="ext-cls-def12146">
                          <Store size={16} />
                        </div>
                        <div>
                          <div  className="ext-cls-3d54a0db">
                            {res.name}
                            <span style={{ marginLeft: '8px', fontSize: '10px', background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                              {(res.branch_type || 'Standalone').replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div  className="ext-cls-f3cd0888">
                            <div  className="animate-pulse ext-cls-43522f59"></div> Active Live Sync
                          </div>
                        </div>
                      </div>
                    </td>
                    <td  className="ext-cls-b65a50f4">
                      <div  className="ext-cls-b35a3622">
                         {res.city || 'Active Restaurant'}
                      </div>
                      <div  className="ext-cls-d14b7f23">{res.branch_code || 'ID: ' + res.id}</div>
                    </td>
                    <td className="ext-cls-b65a50f4">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <span className="ext-cls-0c40bbfd" style={{ fontWeight: 800 }}>{nodeStaff.length} Team Members</span>
                          <button onClick={() => {
                            setEditingStaffId(null);
                            setNewStaff({ name: '', email: '', password: '', role: 'user', restaurant_id: res.id });
                            setShowStaffPopup(true);
                          }} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }} title="Add New Member">
                            <Plus size={12} /> CREATE
                          </button>
                          {nodeStaff.length > 0 && (
                            <button onClick={() => toggleExpand(res.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: isExpanded ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.05)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', transition: 'all 0.2s' }} title="View Staff Table">
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />} 
                              {isExpanded ? 'HIDE LIST' : 'VIEW LIST'}
                            </button>
                          )}
                        </div>
                        {!isExpanded && nodeStaff.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {nodeStaff.map(s => (
                              <div key={s.id} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', color: 'rgba(255,255,255,0.8)' }}>
                                {s.name} <span style={{ opacity: 0.5 }}>({(s.role || 'user').replace('_', ' ')})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td  className="ext-cls-2c7416f4">
                      <div  className="ext-cls-013653c3">
                        <button
                          onClick={() => {
                            setNewNode({ ...res });
                            setEditingNodeId(res.id);
                            setShowNodePopup(true);
                          }}
                          className="st-cls-c169967d"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => deleteRestaurant(res.id)} disabled={loadingStates[`delete_restaurant_${res.id}`]}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: loadingStates[`delete_restaurant_${res.id}`] ? 'not-allowed' : 'pointer', padding: '8px', borderRadius: '12px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px' }}
                        >
                          {loadingStates[`delete_restaurant_${res.id}`] ? <div className="spinner-small ext-cls-52f9e06b"  /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {isExpanded && nodeStaff.length > 0 && (
                    <tr>
                      <td colSpan="4" className="ext-cls-9ba1fd4d" style={{ padding: '0 24px 24px 24px' }}>
                        <div className="glass-panel" style={{ marginTop: '16px', borderRadius: '12px' }}>
                          <table className="ext-cls-d8915f8c" style={{ width: '100%', marginBottom: 0 }}>
                            <thead>
                              <tr className="ext-cls-063c6676">
                                <th className="ext-cls-980c8326">NAME & EMAIL</th>
                                <th className="ext-cls-980c8326">OPERATIONAL ROLE</th>
                                <th className="ext-cls-a1f77236" style={{ textAlign: 'right' }}>CONTROL</th>
                              </tr>
                            </thead>
                            <tbody>
                              {nodeStaff.map(staff => (
                                <tr key={`staff-${staff.id}`} className="table-row-hover ext-cls-f6070c60">
                                  <td className="ext-cls-b65a50f4">
                                    <div className="ext-cls-9fdd7fb0">
                                      <div className="ext-cls-eb11af1b">
                                        <Users size={16} />
                                      </div>
                                      <div>
                                        <div className="ext-cls-8fdd9918">{staff.name}</div>
                                        <div className="ext-cls-0d161c89">{staff.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="ext-cls-b65a50f4">
                                    <span className={`role-badge ${staff.role} shadow-sm`}>{(staff.role || 'user').replace('_', ' ')}</span>
                                  </td>
                                  <td className="ext-cls-2c7416f4">
                                    <div className="ext-cls-013653c3">
                                      <button
                                        onClick={() => {
                                          setNewStaff({ ...staff });
                                          setEditingStaffId(staff.id);
                                          setShowStaffPopup(true);
                                        }}
                                        className="st-cls-c169967d"
                                      >
                                        <Edit2 size={14} /> Edit
                                      </button>
                                      <button
                                        onClick={() => deleteUser && deleteUser(staff.id)} 
                                        disabled={loadingStates[`delete_user_${staff.id}`]}
                                        className="btn-global-icon danger"
                                      >
                                        {loadingStates[`delete_user_${staff.id}`] ? <div className="spinner-small ext-cls-52f9e06b" /> : <Trash2 size={16} />}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            }) : (
              <tr>
                <td colSpan="4"  className="ext-cls-9ba1fd4d">
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
