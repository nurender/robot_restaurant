import React from 'react';

export default function SystemSettingsView({ adminUser }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <h1 className="view-title ext-cls-46d76c78" >System Configurations</h1>
      <p className="text-muted ext-cls-a6a615ae" >Communication protocols settings.</p>

      <div className="glass-panel mt-8 ext-cls-135b4d5b" >
        <h4  className="ext-cls-6aa6de90">Profile Verification</h4>
        <div  className="ext-cls-73683d33">
          <div>
            <label  className="ext-cls-66fbf0d3">Administrator Name</label>
            <input type="text" value={adminUser.name || ''} readOnly  className="ext-cls-6559ec3c" />
          </div>
          <div>
            <label  className="ext-cls-66fbf0d3">Designated Role</label>
            <input type="text" value={adminUser.role || ''} readOnly  className="ext-cls-6559ec3c" />
          </div>
        </div>
      </div>
    </div>
  );
}
