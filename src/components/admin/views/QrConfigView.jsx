import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  CreditCard, ShieldCheck, UserCheck, Sliders, Play, RotateCcw,
  Save, Eye, Check, AlertCircle, Sparkles, Building, Search,
  HelpCircle, Trash, Clock
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../config';

export default function QrConfigView({ adminUser }) {
  // State for all setting variables
  const [scope, setScope] = useState('organization');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment settings
  const [payBeforeConfirm, setPayBeforeConfirm] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState({
    upi: true,
    card: true,
    cash: false,
    wallet: false,
    netbanking: false
  });
  const [defaultPayment, setDefaultPayment] = useState('UPI');
  const [showSuccessScreen, setShowSuccessScreen] = useState(true);
  const [autoCancelTime, setAutoCancelTime] = useState('10 Minutes');

  // Authentication settings
  const [requireLogin, setRequireLogin] = useState(false);
  const [loginMethods, setLoginMethods] = useState({
    mobileOtp: true,
    emailOtp: false,
    google: true,
    apple: false
  });
  const [rememberCustomer, setRememberCustomer] = useState(true);

  // Customer Information Table State
  const [customerDetails, setCustomerDetails] = useState({
    name: 'required', // 'required', 'optional', 'disabled'
    mobile: 'required',
    email: 'optional'
  });

  // Ordering Preferences
  const [preferences, setPreferences] = useState({
    guestCheckout: true,
    deliveryInstructions: false,
    specialNotes: true,
    tipOption: true,
    scheduleOrder: false,
    contactless: true,
    estimatedTime: true,
    orderTracking: true,
    allowMultiple: true,
    allowRepeat: false
  });

  // Tip Config
  const [suggestedTips, setSuggestedTips] = useState(['₹20', '₹50', '₹100']);
  const [customTip, setCustomTip] = useState(true);

  // Activity Log State
  const [logs, setLogs] = useState([
    { user: 'Shishir Singh (Admin)', action: 'Changed Pay Before Confirmation', oldVal: 'Disabled', newVal: 'Enabled', time: '10 Mins Ago' },
    { user: 'Shishir Singh (Admin)', action: 'Added UPI as Default Payment', oldVal: 'Cash', newVal: 'UPI', time: '1 Hour Ago' }
  ]);

  // Track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false);

  // Mark changes whenever states update
  const markChanged = () => setHasChanges(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const restId = adminUser?.restaurant_id || 4;
        const res = await axios.get(`${API_URL}/api/mgmt/qr-config?restaurant_id=${restId}`);
        if (res.data && res.data.success && res.data.data) {
          const conf = res.data.data;
          if (conf.payBeforeConfirm !== undefined) setPayBeforeConfirm(conf.payBeforeConfirm);
          if (conf.paymentMethods) setPaymentMethods(conf.paymentMethods);
          if (conf.defaultPayment) setDefaultPayment(conf.defaultPayment);
          if (conf.autoCancelTime) setAutoCancelTime(conf.autoCancelTime);
          if (conf.requireLogin !== undefined) setRequireLogin(conf.requireLogin);
          if (conf.loginMethods) setLoginMethods(conf.loginMethods);
          if (conf.rememberCustomer !== undefined) setRememberCustomer(conf.rememberCustomer);
          if (conf.customerDetails) setCustomerDetails(conf.customerDetails);
          if (conf.preferences) setPreferences(conf.preferences);
          if (conf.suggestedTips) setSuggestedTips(conf.suggestedTips);
          if (conf.customTip !== undefined) setCustomTip(conf.customTip);
        }
      } catch (err) {
        console.error("Failed to load QR Config", err);
      }
    };
    fetchConfig();
  }, [adminUser]);

  const handleSave = async () => {
    try {
      const restId = adminUser?.restaurant_id || 4;
      const configObj = {
        payBeforeConfirm, paymentMethods, defaultPayment, autoCancelTime,
        requireLogin, loginMethods, rememberCustomer, customerDetails,
        preferences, suggestedTips, customTip
      };
      
      const res = await axios.post(`${API_URL}/api/mgmt/qr-config`, {
        restaurant_id: restId,
        config: configObj
      });
      
      if (res.data.success) {
        toast.success('Configuration saved successfully to Database!');
        setHasChanges(false);
        setLogs(prev => [
          { user: adminUser?.name || 'Admin User', action: 'Saved QR Ordering Configuration', oldVal: 'Previous State', newVal: 'Updated State', time: 'Just Now' },
          ...prev
        ]);
      } else {
        toast.error('Failed to save configuration');
      }
    } catch (error) {
      toast.error('Error saving configuration');
      console.error(error);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset settings to default?")) {
      setPayBeforeConfirm(true);
      setRequireLogin(false);
      setCustomerDetails({ name: 'required', mobile: 'required', email: 'optional' });
      setHasChanges(false);
      toast.success('Configuration reset to system defaults!');
    }
  };

  return (
    <div className="qr-config-workspace animate-slide-up">
      <style>{`
        .qr-config-workspace {
          background-color: var(--ap-main-bg, var(--bg-deep)) !important;
          color: var(--ap-text-main, var(--text-main)) !important;
          font-family: 'Inter', sans-serif !important;
          min-height: 100vh;
          padding: 24px;
        }

        .config-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--ap-card-bg, var(--card-bg));
          padding: 20px 24px;
          border-radius: 16px;
          border: 1px solid var(--ap-glass-border, var(--border-default));
          box-shadow: 0 1px 3px rgba(0,0,0,0.01);
          margin-bottom: 24px;
        }

        .config-header h1 {
          font-size: 20px;
          font-weight: 800;
          color: var(--ap-text-main, var(--text-main));
          margin: 0;
        }

        .config-header p {
          font-size: 13px;
          color: var(--ap-text-muted, var(--text-muted));
          margin: 4px 0 0 0;
        }

        .config-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 1200px) {
          .config-layout {
            grid-template-columns: 70% 30% !important;
          }
        }

        .config-card {
          background: var(--ap-card-bg, var(--card-bg));
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.01);
        }

        .config-card-title {
          font-size: 15px;
          font-weight: 800;
          color: var(--ap-text-main, var(--text-main));
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .config-card-desc {
          font-size: 12px;
          color: var(--ap-text-muted, var(--text-muted));
          margin-bottom: 20px;
        }

        /* Swtiches */
        .saas-switch-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: var(--ap-text-main, var(--text-main));
          user-select: none;
        }

        .saas-switch-container {
          position: relative;
          width: 44px;
          height: 24px;
          background: var(--ap-glass-border, var(--border-default));
          border-radius: 99px;
          transition: background-color 0.2s;
        }

        .saas-switch-container.active {
          background: var(--ap-accent-color, var(--accent-color));
        }

        .saas-switch-handle {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: #ffffff;
          border-radius: 50%;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }

        .saas-switch-container.active .saas-switch-handle {
          transform: translateX(20px);
        }

        .config-sub-section {
          background: var(--bg-tertiary);
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 12px;
          padding: 16px;
          margin-top: 16px;
        }

        /* Checkbox grid */
        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
          margin-top: 8px;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--ap-text-main, var(--text-main));
          cursor: pointer;
        }

        .checkbox-input {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid var(--ap-glass-border, var(--border-default));
          cursor: pointer;
        }

        /* Customer Details Table */
        .saas-config-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13px;
        }

        .saas-config-table th {
          font-weight: 700;
          color: var(--ap-text-muted, var(--text-muted));
          padding: 10px 14px;
          border-bottom: 1px solid var(--ap-glass-border, var(--border-default));
          font-size: 11px;
          text-transform: uppercase;
        }

        .saas-config-table td {
          padding: 12px 14px;
          color: var(--ap-text-main, var(--text-main));
          border-bottom: 1px solid var(--ap-glass-border, var(--border-default));
        }

        /* Radio Buttons */
        .radio-wrapper {
          display: inline-flex;
          align-items: center;
          cursor: pointer;
        }

        .radio-input {
          width: 15px;
          height: 15px;
          cursor: pointer;
        }

        /* Live Preview sticky flow */
        .sticky-flow-panel {
          position: sticky;
          top: 24px;
          background: var(--ap-card-bg, var(--card-bg));
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.01);
        }

        .flow-step {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          font-weight: 600;
          color: var(--ap-text-muted, var(--text-muted));
          padding: 10px 12px;
          border-left: 2px solid var(--ap-glass-border, var(--border-default));
          margin-left: 10px;
          position: relative;
        }

        .flow-step.active {
          color: var(--ap-accent-color, var(--accent-color));
          border-left-color: var(--ap-accent-color, var(--accent-color));
          font-weight: 800;
        }

        .flow-step-dot {
          width: 8px;
          height: 8px;
          background: var(--ap-glass-border, var(--border-default));
          border-radius: 50%;
          position: absolute;
          left: -5px;
          top: 15px;
        }

        .flow-step.active .flow-step-dot {
          background: var(--ap-accent-color, var(--accent-color));
          box-shadow: 0 0 0 4px rgba(37,99,235,0.15);
        }

        /* Sticky bottom bar */
        .sticky-save-bar {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--ap-card-bg, var(--card-bg));
          color: var(--ap-text-main, var(--text-main));
          border: 1px solid var(--ap-accent-color, var(--accent-color));
          padding: 12px 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 90%;
          max-width: 680px;
          z-index: 10000;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);
          animation: slideUpSave 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUpSave {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }

        .saas-select-light {
          background: var(--bg-tertiary);
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 600;
          color: var(--ap-text-main, var(--text-main));
          outline: none;
        }

        .preference-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .preference-item {
          background: var(--bg-tertiary);
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Activity Log styles */
        .log-item-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--ap-text-muted, var(--text-muted));
          border-bottom: 1px solid var(--ap-glass-border, var(--border-default));
          padding: 8px 0;
        }

      `}</style>

      {/* --- HEADER BLOCK --- */}
      <div className="config-header">
        <div>
          <h1>QR Ordering Configuration</h1>
          <p>Configure how customers interact with QR ordering across your organization.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={scope}
            onChange={(e) => { setScope(e.target.value); markChanged(); }}
            className="saas-select-light"
          >
            <option value="organization">Entire Organization</option>
            <option value="branch">Selected Branches</option>
            <option value="hotel">Selected Hotels</option>
            <option value="floor">Selected Floors</option>
          </select>
          <button onClick={handleReset} className="sc-btn-outline" style={{ height: '32px', fontSize: '11px', padding: '0 12px' }}>
            <RotateCcw size={12} /> Reset to Default
          </button>
          <button onClick={handleSave} className="sc-btn-primary" style={{ height: '32px', fontSize: '11px', padding: '0 12px' }}>
            <Save size={12} /> Save Changes
          </button>
        </div>
      </div>

      {/* --- WORKSPACE SPLIT LAYOUT --- */}
      <div className="config-layout">

        {/* Left Hand: Settings Forms */}
        <div>

          {/* CATEGORY 1: PAYMENT SETTINGS */}
          <div className="config-card">
            <span className="config-card-title"><CreditCard size={18} className="text-blue-600" /> Payment Settings</span>
            <p className="config-card-desc">Choose whether customers must pay before the kitchen receives the order.</p>

            <label className="saas-switch-label">
              <span>Enable Payment Before Confirmation</span>
              <div
                onClick={() => { setPayBeforeConfirm(!payBeforeConfirm); markChanged(); }}
                className={`saas-switch-container ${payBeforeConfirm ? 'active' : ''}`}
              >
                <div className="saas-switch-handle" />
              </div>
            </label>

            {payBeforeConfirm && (
              <div className="config-sub-section animate-slide-up">
                <span className="filter-label" style={{ marginBottom: '10px' }}>Active Payment Options</span>
                <div className="checkbox-grid">
                  {Object.keys(paymentMethods).map((method) => (
                    <label key={method} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={paymentMethods[method]}
                        onChange={(e) => {
                          setPaymentMethods({ ...paymentMethods, [method]: e.target.checked });
                          markChanged();
                        }}
                        className="checkbox-input"
                      />
                      <span className="capitalize">{method}</span>
                    </label>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
                  <div className="form-field-group">
                    <span>Default Payment Method</span>
                    <select
                      value={defaultPayment}
                      onChange={(e) => { setDefaultPayment(e.target.value); markChanged(); }}
                      className="saas-select-light"
                      style={{ height: '34px' }}
                    >
                      <option value="UPI">UPI (GooglePay/PhonePe)</option>
                      <option value="Card">Debit/Credit Card</option>
                      <option value="Cash">Cash on Counter</option>
                      <option value="Wallet">Digital Wallet</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <span>Auto Cancel Unpaid Session</span>
                    <select
                      value={autoCancelTime}
                      onChange={(e) => { setAutoCancelTime(e.target.value); markChanged(); }}
                      className="saas-select-light"
                      style={{ height: '34px' }}
                    >
                      <option value="5 Minutes">5 Minutes</option>
                      <option value="10 Minutes">10 Minutes</option>
                      <option value="15 Minutes">15 Minutes</option>
                      <option value="30 Minutes">30 Minutes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CATEGORY 2: AUTHENTICATION */}
          <div className="config-card">
            <span className="config-card-title"><ShieldCheck size={18} className="text-green-600" /> Customer Login & Verification</span>
            <p className="config-card-desc">Control login requirements for guest ordering checkouts.</p>

            <label className="saas-switch-label">
              <span>Require Customer Authentication before checkout</span>
              <div
                onClick={() => { setRequireLogin(!requireLogin); markChanged(); }}
                className={`saas-switch-container ${requireLogin ? 'active' : ''}`}
              >
                <div className="saas-switch-handle" />
              </div>
            </label>

            {requireLogin && (
              <div className="config-sub-section animate-slide-up">
                <span className="filter-label" style={{ marginBottom: '10px' }}>Allowed Authentication Routes</span>
                <div className="checkbox-grid">
                  {Object.keys(loginMethods).map((method) => (
                    <label key={method} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={loginMethods[method]}
                        onChange={(e) => {
                          setLoginMethods({ ...loginMethods, [method]: e.target.checked });
                          markChanged();
                        }}
                        className="checkbox-input"
                      />
                      <span className="capitalize">{method.replace('Otp', ' OTP')}</span>
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label className="saas-switch-label">
                    <span>Remember Customer Details (auto-fill returning guests)</span>
                    <div
                      onClick={() => { setRememberCustomer(!rememberCustomer); markChanged(); }}
                      className={`saas-switch-container ${rememberCustomer ? 'active' : ''}`}
                      style={{ scale: '0.85' }}
                    >
                      <div className="saas-switch-handle" />
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* CATEGORY 3: CUSTOMER DETAILS INPUT FIELDS */}
          <div className="config-card">
            <span className="config-card-title"><UserCheck size={18} className="text-violet-600" /> Customer Details Fields</span>
            <p className="config-card-desc">Configure fields that guests must fill out during checkout.</p>

            <table className="saas-config-table">
              <thead>
                <tr>
                  <th>Target Field</th>
                  <th>Required</th>
                  <th>Optional</th>
                  <th>Disabled</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(customerDetails).map((field) => (
                  <tr key={field}>
                    <td className="font-bold capitalize">{field === 'name' ? 'Name' : field === 'mobile' ? 'Mobile Number' : 'Email Address'}</td>
                    <td>
                      <input
                        type="radio"
                        name={`customer_details_${field}`}
                        checked={customerDetails[field] === 'required'}
                        onChange={() => { setCustomerDetails({ ...customerDetails, [field]: 'required' }); markChanged(); }}
                        className="radio-input"
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name={`customer_details_${field}`}
                        checked={customerDetails[field] === 'optional'}
                        onChange={() => { setCustomerDetails({ ...customerDetails, [field]: 'optional' }); markChanged(); }}
                        className="radio-input"
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name={`customer_details_${field}`}
                        checked={customerDetails[field] === 'disabled'}
                        onChange={() => { setCustomerDetails({ ...customerDetails, [field]: 'disabled' }); markChanged(); }}
                        className="radio-input"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CATEGORY 4: ORDERING PREFERENCES */}
          <div className="config-card">
            <span className="config-card-title"><Sliders size={18} className="text-amber-500" /> Ordering Preferences</span>
            <p className="config-card-desc">Toggle customer checkout parameters and delivery settings.</p>

            <div className="preference-grid">
              {Object.keys(preferences).map((pref) => (
                <div key={pref} className="preference-item">
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ap-text-main, var(--text-main))' }} className="capitalize">
                    {pref.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <div
                    onClick={() => {
                      setPreferences({ ...preferences, [pref]: !preferences[pref] });
                      markChanged();
                    }}
                    className={`saas-switch-container ${preferences[pref] ? 'active' : ''}`}
                    style={{ scale: '0.8' }}
                  >
                    <div className="saas-switch-handle" />
                  </div>
                </div>
              ))}
            </div>

            {preferences.tipOption && (
              <div className="config-sub-section animate-slide-up">
                <span className="filter-label" style={{ marginBottom: '10px' }}>Suggested Tips Suggestions</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {suggestedTips.map((tip, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={tip}
                      onChange={(e) => {
                        const newTips = [...suggestedTips];
                        newTips[idx] = e.target.value;
                        setSuggestedTips(newTips);
                        markChanged();
                      }}
                      className="form-input-light"
                      style={{ width: '80px', height: '34px' }}
                    />
                  ))}
                  <label className="checkbox-item pl-4">
                    <input
                      type="checkbox"
                      checked={customTip}
                      onChange={(e) => { setCustomTip(e.target.checked); markChanged(); }}
                      className="checkbox-input"
                    />
                    <span>Allow Custom Tip</span>
                  </label>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Hand Sticky Sidebar Preview */}
        <div>
          <div className="sticky-flow-panel">
            <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: 800, color: 'var(--ap-text-main, var(--text-main))', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={16} className="text-blue-600" /> Customer Flow Preview
            </h4>

            <div>
              <div className="flow-step active">
                <span className="flow-step-dot" />
                <span>1. Scan QR Code</span>
              </div>
              <div className={`flow-step ${requireLogin ? 'active' : ''}`}>
                <span className="flow-step-dot" />
                <span>2. Login Verification {!requireLogin && "(Skipped)"}</span>
              </div>
              <div className="flow-step active">
                <span className="flow-step-dot" />
                <span>3. Enter Details {customerDetails.name === 'required' ? "(Name Req)" : ""}</span>
              </div>
              <div className="flow-step active">
                <span className="flow-step-dot" />
                <span>4. Browse Menu</span>
              </div>
              <div className={`flow-step ${payBeforeConfirm ? 'active' : ''}`}>
                <span className="flow-step-dot" />
                <span>5. Payment Check {payBeforeConfirm ? `(${defaultPayment})` : "(Postpaid)"}</span>
              </div>
              <div className="flow-step active">
                <span className="flow-step-dot" />
                <span>6. Order Confirmed KDS Receives</span>
              </div>
            </div>

            <div style={{ marginTop: '24px', borderTop: '1px solid var(--ap-glass-border, var(--border-default))', paddingTop: '16px' }}>
              <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', color: 'var(--ap-text-muted, var(--text-muted))', textTransform: 'uppercase' }}>Scope History Audit</h5>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {logs.map((log, i) => (
                  <div key={i} className="log-item-row">
                    <div>
                      <strong>{log.action}</strong>
                      <p style={{ margin: '2px 0 0 0', color: 'var(--ap-text-muted, var(--text-muted))', fontSize: '9px' }}>{log.user}</p>
                    </div>
                    <span style={{ fontSize: '9px', color: 'var(--ap-text-muted, var(--text-muted))' }}>{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* --- STICKY BOTTOM SAVEBAR PANEL --- */}
      {hasChanges && (
        <div className="sticky-save-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} className="text-amber-500" />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>You have unsaved changes in your configuration scope.</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setHasChanges(false)} className="sc-btn-outline" style={{ background: 'transparent', color: 'var(--ap-text-muted, var(--text-muted))', border: '1px solid var(--ap-glass-border, var(--border-default))', height: '30px', fontSize: '11px' }}>
              Discard
            </button>
            <button onClick={handleSave} className="sc-btn-primary" style={{ height: '30px', fontSize: '11px' }}>
              Save Changes
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
