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
  const toggleExpand = id => {
    setExpandedMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  const handleOpenNewBranch = (parentId = null) => {
    setEditingNodeId(null);
    setNewNode({
      name: '', branch_code: '', branch_type: 'standalone', organization_id: null, parent_id: parentId, brand_name: '', description: '',
      address: '', landmark: '', city: '', state: '', country: 'India', pincode: '', latitude: '', longitude: '',
      phone: '', whatsapp_number: '', manager_name: '', email: '', is_24x7: false,
      working_hours: {
        Monday: { open: '09:00', close: '22:00' }, Tuesday: { open: '09:00', close: '22:00' },
        Wednesday: { open: '09:00', close: '22:00' }, Thursday: { open: '09:00', close: '22:00' },
        Friday: { open: '09:00', close: '22:00' }, Saturday: { open: '09:00', close: '22:00' },
        Sunday: { open: '09:00', close: '22:00' }
      },
      delivery_radius: '', min_order_amount: '', delivery_charges: '', free_delivery_above: '',
      gst_number: '', cgst: 2.5, sgst: 2.5, is_round_off: true, invoice_prefix: '', bill_footer: '',
      ai_greeting: '', ai_language: 'English', ai_tone: 'friendly', logo_url: '', cover_url: ''
    });
    setShowNodePopup(true);
  };

  const parents = restaurantsList.filter(r => !r.parent_id);

  return <div className="view-container animate-slide-up">
    <div className="view-header-row">
      <div className="header-left">
        <h1 className="view-title">Restaurant Network</h1>
        <p className="text-muted">Overview of all active restaurants in the cluster.</p>
      </div>
      <button className="btn-primary" onClick={() => handleOpenNewBranch()}>
        <Plus size={20} />
        <span>Add New Branch / Restaurant</span>
      </button>
    </div>
    <div className="glass-panel ext-cls-bdf67aa8">
      <table className="ext-cls-d8915f8c">
        <thead>
          <tr className="ext-cls-063c6676">
            <th className="ext-cls-980c8326">RESTAURANT INFO</th>
            <th className="ext-cls-980c8326">LOCATION & CODE</th>
            <th className="ext-cls-980c8326">TEAM MEMBERS</th>
            <th className="ext-cls-a1f77236">CONTROL</th>
          </tr>
        </thead>
        <tbody>
          {parents.length > 0 ? parents.map(res => {
            const nodeStaff = staffList.filter(s => s.restaurant_id == res.id);
            const childBranches = restaurantsList.filter(c => c.parent_id === res.id);
            const isExpanded = !!expandedMap[res.id];
            const isChild = false;
            return <React.Fragment key={res.id}>
              <tr className={`table-row-hover ext-cls-f6070c60 ${isExpanded ? 'bg-white/5' : ''}`}>
                <td className="ext-cls-b65a50f4">
                  <div className="ext-cls-b68c5feb">
                    <div className="ext-cls-def12146">
                      <Store size={16} />
                    </div>
                    <div>
                      <div className="ext-cls-3d54a0db">
                        {res.name} {isChild && <span className="text-muted text-xs font-normal ml-2">(Sub-Branch)</span>}
                        <span className="ex-style-c60424">
                          {(res.branch_type || 'Standalone').replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="ext-cls-f3cd0888">
                        <div className="animate-pulse ext-cls-43522f59"></div> Active Live Sync
                      </div>
                    </div>
                  </div>
                </td>
                <td className="ext-cls-b65a50f4">
                  <div className="ext-cls-b35a3622">
                    {res.city || 'Active Restaurant'}
                  </div>
                  <div className="ext-cls-d14b7f23">{res.branch_code || 'ID: ' + res.id}</div>
                </td>
                <td className="ext-cls-b65a50f4">
                  <div className="ex-style-11a32e">
                    <div className="ex-style-56abe2">
                      <span className="ext-cls-0c40bbfd ex-style-fbe6fc">{nodeStaff.length} Team Members</span>
                      <button onClick={() => {
                        setEditingStaffId(null);
                        setNewStaff({
                          name: '',
                          email: '',
                          password: '',
                          role: 'user',
                          restaurant_id: res.id
                        });
                        setShowStaffPopup(true);
                      }} title="Add New Member" className="ex-style-4f8937">
                        <Plus size={12} /> CREATE
                      </button>
                      <button onClick={() => handleOpenNewBranch(res.id)} title="Add New Branch / Restaurant" className="ex-style-4f8937" style={{ marginLeft: '4px' }}>
                        <Plus size={12} /> ADD BRANCH
                      </button>
                      {(nodeStaff.length > 0 || childBranches.length > 0) && <button onClick={() => toggleExpand(res.id)} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: isExpanded ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.05)',
                        color: '#3b82f6',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }} title="View Staff and Sub-Branches">
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {isExpanded ? 'HIDE DETAILS' : 'VIEW DETAILS'}
                      </button>}
                    </div>
                    {!isExpanded && nodeStaff.length > 0 && <div className="ex-style-46c83b">
                      {nodeStaff.map(s => <div key={s.id} className="ex-style-a787f7">
                        {s.name} <span className="ex-style-0b6b2b">({(s.role || 'user').replace('_', ' ')})</span>
                      </div>)}
                    </div>}
                  </div>
                </td>
                <td className="ext-cls-2c7416f4">
                  <div className="ext-cls-013653c3">
                    <button onClick={() => {
                      setNewNode({
                        ...res
                      });
                      setEditingNodeId(res.id);
                      setShowNodePopup(true);
                    }} className="st-cls-c169967d">
                      <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => deleteRestaurant(res.id)} disabled={loadingStates[`delete_restaurant_${res.id}`]} style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      color: '#ef4444',
                      cursor: loadingStates[`delete_restaurant_${res.id}`] ? 'not-allowed' : 'pointer',
                      padding: '8px',
                      borderRadius: '12px',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '34px',
                      height: '34px'
                    }}>
                      {loadingStates[`delete_restaurant_${res.id}`] ? <div className="spinner-small ext-cls-52f9e06b" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </td>
              </tr>

              {isExpanded && (nodeStaff.length > 0 || childBranches.length > 0) && <tr>
                <td colSpan="4" className="bg-[#F8FAFC] p-6 rounded-b-xl border border-t-0 border-gray-100">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {nodeStaff.length > 0 && <div className="glass-panel ex-style-f92e88">
                      <h4 className="text-white font-bold mb-2 ml-2" style={{ padding: '10px 10px 1px 16px' }}>Team Members</h4>
                      <table className="ext-cls-d8915f8c ex-style-112887">
                        <thead>
                          <tr className="ext-cls-063c6676">
                            <th className="ext-cls-980c8326">NAME & EMAIL</th>
                            <th className="ext-cls-980c8326">OPERATIONAL ROLE</th>
                            <th className="ext-cls-a1f77236 ex-style-e12b71">CONTROL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nodeStaff.map(staff => <tr key={`staff-${staff.id}`} className="table-row-hover ext-cls-f6070c60">
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
                                <button onClick={() => {
                                  setNewStaff({
                                    ...staff
                                  });
                                  setEditingStaffId(staff.id);
                                  setShowStaffPopup(true);
                                }} className="st-cls-c169967d">
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button onClick={() => deleteUser && deleteUser(staff.id)} disabled={loadingStates[`delete_user_${staff.id}`]} className="btn-global-icon danger">
                                  {loadingStates[`delete_user_${staff.id}`] ? <div className="spinner-small ext-cls-52f9e06b" /> : <Trash2 size={16} />}
                                </button>
                              </div>
                            </td>
                          </tr>)}
                        </tbody>
                      </table>
                    </div>}
                    {childBranches.length > 0 && <div className="glass-panel ex-style-f92e88">
                      <h4 className="text-white font-bold mb-2 ml-2" style={{ padding: '10px 10px 1px 16px' }}>Sub-Branches</h4>
                      <table className="ext-cls-d8915f8c ex-style-112887">
                        <thead>
                          <tr className="ext-cls-063c6676">
                            <th className="ext-cls-980c8326">NAME & TYPE</th>
                            <th className="ext-cls-980c8326">LOCATION</th>
                            <th className="ext-cls-a1f77236 ex-style-e12b71">CONTROL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {childBranches.map(child => (
                            <tr key={`child-${child.id}`} className="table-row-hover ext-cls-f6070c60">
                              <td className="ext-cls-b65a50f4">
                                <div className="ext-cls-9fdd7fb0">
                                  <div className="ext-cls-eb11af1b">
                                    <Store size={16} />
                                  </div>
                                  <div>
                                    <div className="ext-cls-8fdd9918">{child.name}</div>
                                    <div className="ext-cls-0d161c89">{(child.branch_type || 'Standalone').replace('_', ' ').toUpperCase()}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="ext-cls-b65a50f4">
                                <div className="ext-cls-8fdd9918">{child.city || 'N/A'}</div>
                                <div className="ext-cls-0d161c89">{child.branch_code}</div>
                              </td>
                              <td className="ext-cls-2c7416f4">
                                <div className="ext-cls-013653c3">
                                  <button onClick={() => {
                                    setNewNode({ ...child });
                                    setEditingNodeId(child.id);
                                    setShowNodePopup(true);
                                  }} className="st-cls-c169967d">
                                    <Edit2 size={14} /> Edit
                                  </button>
                                  <button onClick={() => deleteRestaurant(child.id)} disabled={loadingStates[`delete_restaurant_${child.id}`]} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }}>
                                    <Trash2 size={14} /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>}
                  </div>
                </td>
              </tr>}
            </React.Fragment>;
          }) : <tr>
            <td colSpan="4" className="ext-cls-9ba1fd4d">
              No restaurants found in the network.
            </td>
          </tr>}
        </tbody>
      </table>
    </div>
  </div>;
}