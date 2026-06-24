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
          <div key={resto.id}  className="ext-cls-f20de93e">
            <div  className="ext-cls-724511d1">
              <div  className="ext-cls-84ddd069">
                <Store size={20} />
              </div>
              <div>
                <h2  className="ext-cls-06cbdd52">{resto.name}</h2>
                <p  className="ext-cls-b98663d3">{restoStaff.length} Members Assigned</p>
              </div>
              <div  className="ext-cls-5dab6de6">
                <button
                  onClick={() => {
                    setNewNode({ ...resto });
                    setEditingNodeId(resto.id);
                    setShowNodePopup(true);
                  }}
                  className="st-cls-dcd8fdb7"
                >
                  <Edit2 size={12} /> EDIT RESTO
                </button>
                <button
                  onClick={() => deleteRestaurant(resto.id)}
                  className="st-cls-dcd8fdb7"
                  style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}
                >
                  <Trash2 size={12} /> DELETE
                </button>
              </div>
            </div>
            <div className="glass-panel ext-cls-bdf67aa8" >
              <table  className="ext-cls-d8915f8c">
                <thead>
                  <tr  className="ext-cls-063c6676">
                    <th  className="ext-cls-980c8326">NAME & EMAIL</th>
                    <th  className="ext-cls-980c8326">SYSTEM ROLE</th>
                    <th  className="ext-cls-a1f77236">CONTROL</th>
                  </tr>
                </thead>
                <tbody>
                  {restoStaff.length > 0 ? restoStaff.map(staff => (
                    <tr key={staff.id}  className="table-row-hover ext-cls-f6070c60">
                      <td  className="ext-cls-b65a50f4">
                        <div  className="ext-cls-b68c5feb">
                          <div  className="ext-cls-eefefffc">
                            <Users size={16} />
                          </div>
                          <div>
                            <div  className="ext-cls-8fdd9918">{staff.name}</div>
                            <div  className="ext-cls-0d161c89">{staff.email}</div>
                          </div>
                        </div>
                      </td>
                      <td  className="ext-cls-b65a50f4">
                        <span className={`role-badge ${staff.role} shadow-sm`}>{(staff.role || 'user').replace('_', ' ')}</span>
                      </td>
                      <td  className="ext-cls-2c7416f4">
                        <div  className="ext-cls-013653c3">
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
                            onClick={() => deleteUser(staff.id)} disabled={loadingStates[`delete_user_${staff.id}`]}
                            className="btn-global-icon danger"
                          >
                            {loadingStates[`delete_user_${staff.id}`] ? <div className="spinner-small ext-cls-52f9e06b"  /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3"  className="ext-cls-9ba1fd4d">
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
          <div  className="ext-cls-f20de93e">
            <div  className="ext-cls-724511d1">
              <div  className="ext-cls-84ddd069">
                <Sparkles size={20} />
              </div>
              <div>
                <h2  className="ext-cls-06cbdd52">Global Administrators</h2>
                <p  className="ext-cls-b98663d3">Unassigned or Master Accounts</p>
              </div>
            </div>
            <div className="glass-panel ext-cls-bdf67aa8" >
              <table  className="ext-cls-d8915f8c">
                <thead>
                  <tr  className="ext-cls-063c6676">
                    <th  className="ext-cls-980c8326">NAME & EMAIL</th>
                    <th  className="ext-cls-980c8326">SYSTEM ROLE</th>
                    <th  className="ext-cls-a1f77236">CONTROL</th>
                  </tr>
                </thead>
                <tbody>
                  {globalStaff.map(staff => (
                    <tr key={staff.id}  className="table-row-hover ext-cls-f6070c60">
                      <td  className="ext-cls-b65a50f4">
                        <div  className="ext-cls-b68c5feb">
                          <div  className="ext-cls-eefefffc">
                            <Users size={16} />
                          </div>
                          <div>
                            <div  className="ext-cls-8fdd9918">{staff.name}</div>
                            <div  className="ext-cls-0d161c89">{staff.email}</div>
                          </div>
                        </div>
                      </td>
                      <td  className="ext-cls-b65a50f4">
                        <span className={`role-badge ${staff.role} shadow-sm`}>{(staff.role || 'user').replace('_', ' ')}</span>
                      </td>
                      <td  className="ext-cls-2c7416f4">
                        <div  className="ext-cls-013653c3">
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
                            onClick={() => deleteUser(staff.id)} disabled={loadingStates[`delete_user_${staff.id}`]}
                            className="btn-global-icon danger"
                          >
                            {loadingStates[`delete_user_${staff.id}`] ? <div className="spinner-small ext-cls-52f9e06b"  /> : <Trash2 size={16} />}
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
