import { Edit, Trash2, Plus } from 'lucide-react';
import React from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import RoleEditorModal from '../modals/RoleEditorModal';

export default function RolesManagementView({ dbRoles, setDbRoles, currentRoleData, setCurrentRoleData, isRoleModalOpen, setIsRoleModalOpen }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8 ext-cls-6902f166" >
        <div className="header-left">
          <h1 className="view-title ext-cls-46d76c78" >Role Management</h1>
          <p className="text-muted ext-cls-a6a615ae" >Configure system-wide administrative privileges and module access.</p>
        </div>
        <button
          className="btn-primary st-cls-e43391c1"
          onClick={() => {
            setCurrentRoleData({ name: '', permissions: [] });
            setIsRoleModalOpen(true);
          }}
          
        >
          <Plus size={20} /> Add New Role
        </button>
      </div>

      <div className="glass-panel ext-cls-bdf67aa8" >
        <table  className="ext-cls-d8915f8c">
          <thead>
            <tr  className="ext-cls-063c6676">
              <th  className="ext-cls-980c8326">IDENTITY / ROLE NAME</th>
              <th  className="ext-cls-980c8326">ACCESS SCOPE</th>
              <th  className="ext-cls-980c8326">MODULES</th>
              <th  className="ext-cls-a1f77236">CONTROL</th>
            </tr>
          </thead>
          <tbody>
            {dbRoles.map((role) => (
              <tr key={role.id}  className="table-row-hover ext-cls-f6070c60">
                <td  className="ext-cls-b65a50f4">
                  <div  className="ext-cls-cc0ebbd6">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: role.name === 'super_admin' ? '#10b981' : 'var(--accent-primary)' }} />
                    <span  className="ext-cls-96b5c7c6">{(role.name || '').replace('_', ' ')}</span>
                  </div>
                </td>
                <td  className="ext-cls-b65a50f4">
                  <span  className="ext-cls-d84a5f61">
                    {role.permissions.length} Active Modules
                  </span>
                </td>
                <td  className="ext-cls-b65a50f4">
                  <div  className="ext-cls-b552c8a3">
                    {role.permissions.slice(0, 4).map(p => (
                      <span key={p}  className="ext-cls-826db71a">{(p || '').replace('_', ' ')}</span>
                    ))}
                    {role.permissions.length > 4 && <span  className="ext-cls-fc38bcec">+{role.permissions.length - 4} more</span>}
                  </div>
                </td>
                <td  className="ext-cls-2c7416f4">
                  <div  className="ext-cls-013653c3">
                    <button
                      onClick={() => {
                        setCurrentRoleData(role);
                        setIsRoleModalOpen(true);
                      }}
                      className="st-cls-3bab5979"
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
                      className="st-cls-82527b1e"
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
