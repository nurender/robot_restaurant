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
              return (
                <tr key={res.id}  className="table-row-hover ext-cls-f6070c60">
                  <td  className="ext-cls-b65a50f4">
                    <div  className="ext-cls-b68c5feb">
                      <div  className="ext-cls-def12146">
                        <Store size={16} />
                      </div>
                      <div>
                        <div  className="ext-cls-3d54a0db">{res.name}</div>
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
                  <td  className="ext-cls-b65a50f4">
                    <div  className="ext-cls-9fdd7fb0">
                      <span  className="ext-cls-0c40bbfd">{nodeStaff.length} Members</span>
                      <button onClick={() => {
                        setNewStaff({ ...newStaff, restaurant_id: res.id });
                        setShowStaffPopup(true);
                      }} className="st-cls-f79a5a40" title="Add Member">
                        <Plus size={14} />
                      </button>
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
