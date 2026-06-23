import React from 'react';

export default function RestaurantNodeModal({
  isOpen,
  onClose,
  editingNodeId,
  newNode,
  setNewNode,
  handleAddNode,
  nodeActiveTab,
  setNodeActiveTab,
  isLoading
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '800px', width: '95%', padding: '40px', borderRadius: '32px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-xl)', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>{editingNodeId ? 'Edit Restaurant' : 'Add New Restaurant'}</h3>
        <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>Initialize operational backend for your restaurant network.</p>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', marginBottom: '24px', overflowX: 'auto', gap: '20px' }} className="scrollbar-hidden">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'location', label: 'Location' },
            { id: 'contact', label: 'Contact' },
            { id: 'timings', label: 'Timings' },
            { id: 'delivery', label: 'Delivery' },
            { id: 'billing', label: 'Billing' },
            { id: 'ai', label: 'AI Settings' },
            { id: 'branding', label: 'Branding' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setNodeActiveTab(t.id)}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderBottom: nodeActiveTab === t.id ? '3px solid var(--accent-primary)' : '3px solid transparent',
                color: nodeActiveTab === t.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontWeight: '800',
                fontSize: '12px',
                background: nodeActiveTab === t.id ? 'rgba(124, 58, 237, 0.05)' : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.2s ease',
                borderRadius: '8px 8px 0 0'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleAddNode} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {nodeActiveTab === 'basic' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>BRANCH NAME *</label>
                  <input type="text" value={newNode.name} onChange={(e) => setNewNode({ ...newNode, name: e.target.value })} required style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>BRANCH CODE (UNIQUE) *</label>
                  <input type="text" placeholder="e.g. CC-JP-01" value={newNode.branch_code} onChange={(e) => setNewNode({ ...newNode, branch_code: e.target.value })} required style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>RESTAURANT BRAND NAME</label>
                <input type="text" value={newNode.brand_name} onChange={(e) => setNewNode({ ...newNode, brand_name: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>BRANCH TYPE</label>
                <select value={newNode.branch_type} onChange={(e) => setNewNode({ ...newNode, branch_type: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }}>
                  <option value="dine_in">Dine-in</option>
                  <option value="delivery">Delivery Only</option>
                  <option value="pickup">Pickup Only</option>
                  <option value="cloud_kitchen">Cloud Kitchen</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>DESCRIPTION</label>
                <textarea value={newNode.description} onChange={(e) => setNewNode({ ...newNode, description: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px', minHeight: '80px' }} />
              </div>
            </div>
          )}

          {nodeActiveTab === 'location' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>FULL ADDRESS *</label>
                <textarea value={newNode.address} onChange={(e) => setNewNode({ ...newNode, address: e.target.value })} required style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px', minHeight: '60px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>LANDMARK</label>
                  <input type="text" value={newNode.landmark} onChange={(e) => setNewNode({ ...newNode, landmark: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>CITY *</label>
                  <input type="text" value={newNode.city} onChange={(e) => setNewNode({ ...newNode, city: e.target.value })} required style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>STATE</label>
                  <input type="text" value={newNode.state} onChange={(e) => setNewNode({ ...newNode, state: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>COUNTRY</label>
                  <input type="text" value={newNode.country} onChange={(e) => setNewNode({ ...newNode, country: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>PINCODE</label>
                  <input type="text" value={newNode.pincode} onChange={(e) => setNewNode({ ...newNode, pincode: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>LATITUDE</label>
                  <input type="number" step="any" placeholder="26.9124" value={newNode.latitude} onChange={(e) => setNewNode({ ...newNode, latitude: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>LONGITUDE</label>
                  <input type="number" step="any" placeholder="75.7873" value={newNode.longitude} onChange={(e) => setNewNode({ ...newNode, longitude: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
              </div>
            </div>
          )}

          {nodeActiveTab === 'contact' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>PHONE NUMBER *</label>
                  <input type="tel" value={newNode.phone} onChange={(e) => setNewNode({ ...newNode, phone: e.target.value })} required style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>WHATSAPP NUMBER</label>
                  <input type="tel" value={newNode.whatsapp_number} onChange={(e) => setNewNode({ ...newNode, whatsapp_number: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>MANAGER NAME</label>
                <input type="text" value={newNode.manager_name} onChange={(e) => setNewNode({ ...newNode, manager_name: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>BRANCH EMAIL</label>
                <input type="email" value={newNode.email} onChange={(e) => setNewNode({ ...newNode, email: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
              </div>
            </div>
          )}

          {nodeActiveTab === 'timings' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <span style={{ fontWeight: '700' }}>24x7 Operational</span>
                <input type="checkbox" checked={newNode.is_24x7} onChange={(e) => setNewNode({ ...newNode, is_24x7: e.target.checked })} />
              </div>
              {!newNode.is_24x7 && Object.keys(newNode.working_hours || {}).map(day => (
                <div key={day} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: '700', fontSize: '13px' }}>{day}</span>
                  <input type="time" value={newNode.working_hours[day].open} onChange={(e) => {
                    const wh = { ...newNode.working_hours };
                    wh[day].open = e.target.value;
                    setNewNode({ ...newNode, working_hours: wh });
                  }} style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white' }} />
                  <input type="time" value={newNode.working_hours[day].close} onChange={(e) => {
                    const wh = { ...newNode.working_hours };
                    wh[day].close = e.target.value;
                    setNewNode({ ...newNode, working_hours: wh });
                  }} style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white' }} />
                </div>
              ))}
            </div>
          )}

          {nodeActiveTab === 'delivery' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>DELIVERY RADIUS (KM)</label>
                  <input type="number" value={newNode.delivery_radius} onChange={(e) => setNewNode({ ...newNode, delivery_radius: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>MIN ORDER (₹)</label>
                  <input type="number" value={newNode.min_order_amount} onChange={(e) => setNewNode({ ...newNode, min_order_amount: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>DELIVERY CHARGES (₹)</label>
                  <input type="number" value={newNode.delivery_charges} onChange={(e) => setNewNode({ ...newNode, delivery_charges: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>FREE DELIVERY ABOVE (₹)</label>
                  <input type="number" value={newNode.free_delivery_above} onChange={(e) => setNewNode({ ...newNode, free_delivery_above: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
              </div>
            </div>
          )}

          {nodeActiveTab === 'billing' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>GST NUMBER</label>
                <input type="text" placeholder="22AAAAA0000A1Z5" value={newNode.gst_number} onChange={(e) => setNewNode({ ...newNode, gst_number: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>CGST (%)</label>
                  <input type="number" value={newNode.cgst} onChange={(e) => setNewNode({ ...newNode, cgst: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>SGST (%)</label>
                  <input type="number" value={newNode.sgst} onChange={(e) => setNewNode({ ...newNode, sgst: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>ROUND OFF BILL</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <input type="checkbox" checked={newNode.is_round_off} onChange={(e) => setNewNode({ ...newNode, is_round_off: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>Enabled</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>INVOICE PREFIX</label>
                  <input type="text" value={newNode.invoice_prefix} onChange={(e) => setNewNode({ ...newNode, invoice_prefix: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>BILL FOOTER NOTE</label>
                  <input type="text" value={newNode.bill_footer} onChange={(e) => setNewNode({ ...newNode, bill_footer: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
                </div>
              </div>
            </div>
          )}

          {nodeActiveTab === 'ai' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>AI GREETING MESSAGE</label>
                <textarea value={newNode.ai_greeting} onChange={(e) => setNewNode({ ...newNode, ai_greeting: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px', minHeight: '80px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>LANGUAGE</label>
                  <select value={newNode.ai_language} onChange={(e) => setNewNode({ ...newNode, ai_language: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }}>
                    <option value="English">English Only</option>
                    <option value="Hindi">Hindi Only</option>
                    <option value="Hinglish">Hinglish (Mix)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>TONE</label>
                  <select value={newNode.ai_tone} onChange={(e) => setNewNode({ ...newNode, ai_tone: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }}>
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                    <option value="funny">Funny / Witty</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {nodeActiveTab === 'branding' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>BRANCH LOGO URL</label>
                <input type="text" value={newNode.logo_url} onChange={(e) => setNewNode({ ...newNode, logo_url: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>COVER IMAGE URL</label>
                <input type="text" value={newNode.cover_url} onChange={(e) => setNewNode({ ...newNode, cover_url: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--card-border)' }}>
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
              {isLoading ? <div className="spinner-small" /> : (nodeActiveTab === 'branding' ? 'Deploy Node 🚀' : 'Next Step →')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
