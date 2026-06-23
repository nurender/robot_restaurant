import React from 'react';

export default function RiderModal({
  isOpen,
  onClose,
  editingRiderId,
  newRider,
  setNewRider,
  handleSaveRider,
  isLoading
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay ext-cls-ba6f5ec3" >
      <div className="modal-content glass-panel animate-slide-up ext-cls-70401b5f" >
        <div  className="ext-cls-72e6eb14">
          <div>
            <h3  className="ext-cls-d2df4e7d">{editingRiderId ? 'Update Rider Profile' : 'Recruit New Rider'}</h3>
            <p className="text-muted ext-cls-be2c6b24" >Onboard delivery agents to your fleet network.</p>
          </div>
          {editingRiderId && (
            <div  className="ext-cls-22fbab1e">
              <label  className="ext-cls-d1c0e8a8">CURRENT STATUS</label>
              <select
                value={newRider.status}
                onChange={(e) => setNewRider({ ...newRider, status: e.target.value })}
                className="st-cls-6bc99e0a"
              >
                <option value="online">Online</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          )}
        </div>

        <div  className="ext-cls-3c5b27b9">
          <div  className="ext-cls-ce73a9c0">
            <label  className="ext-cls-785d0102">Full Name *</label>
            <input type="text" placeholder="e.g. Rahul Kumar" value={newRider.name} onChange={(e) => setNewRider({ ...newRider, name: e.target.value })} className="st-cls-5c6cc8f1" />
          </div>
          <div  className="ext-cls-ce73a9c0">
            <label  className="ext-cls-785d0102">Phone Number *</label>
            <input type="text" placeholder="+91 XXXXX XXXXX" value={newRider.phone} onChange={(e) => setNewRider({ ...newRider, phone: e.target.value })} className="st-cls-5c6cc8f1" />
          </div>

          <div>
            <label  className="ext-cls-785d0102">Vehicle Number</label>
            <input type="text" placeholder="e.g. DL 01 AB 1234" value={newRider.vehicle_number} onChange={(e) => setNewRider({ ...newRider, vehicle_number: e.target.value })} className="st-cls-5c6cc8f1" />
          </div>
          <div>
            <label  className="ext-cls-785d0102">License Number</label>
            <input type="text" placeholder="e.g. DLXXXXXXXXXXXXX" value={newRider.license_number} onChange={(e) => setNewRider({ ...newRider, license_number: e.target.value })} className="st-cls-5c6cc8f1" />
          </div>

          <div  className="ext-cls-69e8d8a0">
            <label  className="ext-cls-785d0102">Residential Address</label>
            <textarea placeholder="Complete address..." value={newRider.address} onChange={(e) => setNewRider({ ...newRider, address: e.target.value })} className="st-cls-9a43debe" />
          </div>

          <div  className="ext-cls-69e8d8a0">
            <label  className="ext-cls-785d0102">Emergency Contact (Name/Phone)</label>
            <input type="text" placeholder="e.g. Brother: 98XXXXXXXX" value={newRider.emergency_contact} onChange={(e) => setNewRider({ ...newRider, emergency_contact: e.target.value })} className="st-cls-5c6cc8f1" />
          </div>
        </div>

        <div  className="ext-cls-38fa89c7">
          <button className="btn-global-outline" onClick={onClose} >Cancel</button>
          <button
            className="btn-global-primary"
            disabled={isLoading}
            onClick={handleSaveRider}
            
          >
            {isLoading ? <div className="spinner-small" /> : (editingRiderId ? 'Synchronize Profile' : 'Confirm Recruitment')}
          </button>
        </div>
      </div>
    </div>
  );
}
