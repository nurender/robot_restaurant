import toast from 'react-hot-toast';
import { Plus, Check } from 'lucide-react';
import React from 'react';
import apiService from '../../../services/apiService';
import { API_URL } from '../../../config';
export default function RoleEditorModal({
  isOpen,
  onClose,
  currentRoleData,
  setCurrentRoleData,
  onSaveSuccess,
  orderedSidebar = []
}) {
  if (!isOpen) return null;
  const dynamicModules = orderedSidebar.map(item => ({
    id: String(item.id),
    label: item.label
  }));
  const handleSave = async () => {
    if (!currentRoleData.name) return toast("Role name is required");
    try {
      await apiService.createRole(currentRoleData);
      const res = await apiService.getRoles();
      onSaveSuccess(res.data.data);
      onClose();
    } catch (e) {
      toast.error("Failed to save role");
    }
  };
  return <div className="modal-overlay ext-cls-adf4c2ed">
      <div className="glass-panel ext-cls-fa1b0ca0">
        <div className="ext-cls-30a8614c">
          <div>
            <h2 className="ext-cls-d2df4e7d">{currentRoleData.id ? 'Edit Access Role' : 'Initialize New Role'}</h2>
            <p className="ext-cls-6abaddeb">Modify the security parameters and permitted system modules.</p>
          </div>
          <button onClick={onClose} className="ext-cls-5e24061f">
            <Plus size={20} className="ext-cls-6fd853ff" />
          </button>
        </div>

        <div className="ext-cls-09618076">
          <div className="ext-cls-c88a4204">
            <label className="ext-cls-ac894140">ROLE IDENTIFIER</label>
            <input type="text" value={currentRoleData.name} onChange={e => setCurrentRoleData({
            ...currentRoleData,
            name: e.target.value.toLowerCase().replace(/\s+/g, '_')
          })} placeholder="e.g. store_manager" className="st-cls-28bd0097" />
          </div>

          <div className="ext-cls-02be399f">
            <label className="ext-cls-4602bfef">ACCESS MATRIX</label>
            <div className="ext-cls-f64ce9bf">
              {dynamicModules.length > 0 ? dynamicModules.map(mod => {
              const isSelected = currentRoleData.permissions.includes(mod.id);
              return <div key={mod.id} onClick={() => {
                let newPerms = [...currentRoleData.permissions];
                if (isSelected) newPerms = newPerms.filter(p => p !== mod.id);else newPerms.push(mod.id);
                setCurrentRoleData({
                  ...currentRoleData,
                  permissions: newPerms
                });
              }} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                background: isSelected ? 'rgba(124, 58, 237, 0.15)' : 'var(--bg-deep)',
                borderRadius: '16px',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                transition: 'all 0.2s'
              }}>
                    <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '5px',
                  border: '2px solid',
                  borderColor: isSelected ? 'var(--accent-primary)' : 'var(--card-border)',
                  background: isSelected ? 'var(--accent-primary)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                      {isSelected && <Check size={12} color="#fff" strokeWidth={4} />}
                    </div>
                    <span style={{
                  fontSize: '14px',
                  color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: '700'
                }}>{mod.label || mod.id}</span>
                  </div>;
            }) : <div className="ex-style-79fc9e">Loading system modules...</div>}
            </div>
          </div>
        </div>

        <div className="ext-cls-931e0dd2">
          <button className="btn-global-outline" onClick={onClose}>
            Discard
          </button>
          <button className="btn-global-primary" onClick={handleSave}>
            Confirm & Deploy
          </button>
        </div>
      </div>
    </div>;
}