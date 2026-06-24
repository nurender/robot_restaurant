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
  isLoading,
  dbRoles
}) {
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay ext-cls-ba6f5ec3" >
      <div className="modal-content glass-panel animate-slide-up ext-cls-24f6a0b2" >
        <h3 className="ext-cls-46acfb85">{editingStaffId ? 'Edit Neural Member' : 'Recruit New Member'}</h3>
        <p className="text-muted ext-cls-09ad805c" >Onboard elite operators to manage branch endpoints.</p>

        <form onSubmit={handleAddStaff} className="ext-cls-21558a0c">
          <div>
            <label className="ext-cls-0d619f48">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              required
              className="st-cls-c20866b5"
            />
          </div>

          <div>
            <label className="ext-cls-0d619f48">Email Address *</label>
            <input
              type="email"
              placeholder="e.g. john@swiggy.com"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              required
              className="st-cls-c20866b5"
            />
          </div>

          <div>
            <label className="ext-cls-0d619f48">Secure Password *</label>
            <div className="ext-cls-c46a5b00">
              <input
                type={showStaffPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newStaff.password}
                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                required
                className="st-cls-801ab5af"
              />
              <button
                type="button"
                onClick={() => setShowStaffPassword(!showStaffPassword)}
                className="st-cls-35b457c8"
              >
                {showStaffPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="ext-cls-0d619f48">Operational Role *</label>
            <select
              value={newStaff.role || 'user'}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              className="st-cls-ec9e7265"
            >
              <option value="user">USER (Default)</option>
              {dbRoles && dbRoles.length > 0 ? (
                dbRoles.map(r => (
                  <option key={r.name} value={r.name}>{r.name.replace('_', ' ').toUpperCase()}</option>
                ))
              ) : (
                <>
                  <option value="admin">Branch Admin</option>
                  <option value="super_admin">Master Admin</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="ext-cls-0d619f48">Assign to Restaurant *</label>
            <select
              value={newStaff.restaurant_id || ''}
              onChange={(e) => setNewStaff({ ...newStaff, restaurant_id: e.target.value || null })}
              className={`st-cls-ec9e7265 opacity-50 cursor-not-allowed`}
              disabled={true}
            >
              <option value="">No Specific Restaurant (Global)</option>
              {restaurantsList.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.city})</option>
              ))}
            </select>
          </div>

          <div className="ext-cls-11faf9b7">
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
