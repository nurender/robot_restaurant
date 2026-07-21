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
  const [foodCourts, setFoodCourts] = React.useState([]);

  React.useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:3001/api/food-courts', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
      })
      .then(res => res.json())
      .then(data => setFoodCourts(data))
      .catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay ext-cls-ba6f5ec3" >
      <div className="modal-content glass-panel animate-slide-up ext-cls-e2e5ef2b" >
        <h3  className="ext-cls-46acfb85">{editingNodeId ? 'Edit Restaurant' : 'Add New Restaurant'}</h3>
        <p className="text-muted ext-cls-09ad805c" >Initialize operational backend for your restaurant network.</p>

        <div  className="scrollbar-hidden ext-cls-fe5c2438">
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

        <form onSubmit={handleAddNode}  className="ext-cls-a6e672cb">
          {nodeActiveTab === 'basic' && (
            <div className="animate-fade-in ext-cls-21558a0c" >
              <div  className="ext-cls-5842419a">
                <div>
                  <label  className="ext-cls-0c40bbfd">BRANCH NAME *</label>
                  <input type="text" value={newNode.name} onChange={(e) => setNewNode({ ...newNode, name: e.target.value })} required className="st-cls-30e033af" />
                </div>
                <div>
                  <label  className="ext-cls-0c40bbfd">BRANCH CODE (UNIQUE) *</label>
                  <input type="text" placeholder="e.g. CC-JP-01" value={newNode.branch_code} onChange={(e) => setNewNode({ ...newNode, branch_code: e.target.value })} required className="st-cls-30e033af" />
                </div>
              </div>
              <div>
                <label  className="ext-cls-0c40bbfd">RESTAURANT BRAND NAME</label>
                <input type="text" value={newNode.brand_name} onChange={(e) => setNewNode({ ...newNode, brand_name: e.target.value })} className="st-cls-30e033af" />
              </div>
              <div>
                <label  className="ext-cls-0c40bbfd">BRANCH TYPE</label>
                <select value={newNode.branch_type} onChange={(e) => setNewNode({ ...newNode, branch_type: e.target.value })} className="st-cls-30e033af">
                  <option value="standalone">Independent Branch (Standalone)</option>
                  <option value="food_court">Food Court Branch</option>
                  <option value="dine_in">Dine-in</option>
                  <option value="delivery">Delivery Only</option>
                  <option value="pickup">Pickup Only</option>
                  <option value="cloud_kitchen">Cloud Kitchen</option>
                </select>
              </div>
              {newNode.branch_type === 'food_court' && (
                <div>
                  <label className="ext-cls-0c40bbfd">SELECT FOOD COURT</label>
                  <select value={newNode.organization_id || ''} onChange={(e) => setNewNode({ ...newNode, organization_id: e.target.value })} className="st-cls-30e033af">
                    <option value="">None / Standalone</option>
                    {foodCourts.map(fc => (
                      <option key={fc.id} value={fc.id}>{fc.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label  className="ext-cls-0c40bbfd">DESCRIPTION</label>
                <textarea value={newNode.description} onChange={(e) => setNewNode({ ...newNode, description: e.target.value })} className="st-cls-ec82538c" />
              </div>
            </div>
          )}

          {nodeActiveTab === 'location' && (
            <div className="animate-fade-in ext-cls-21558a0c" >
              <div>
                <label  className="ext-cls-0c40bbfd">FULL ADDRESS *</label>
                <textarea value={newNode.address} onChange={(e) => setNewNode({ ...newNode, address: e.target.value })} required className="st-cls-49264ac0" />
              </div>
              <div  className="ext-cls-5842419a">
                <div>
                  <label  className="ext-cls-0c40bbfd">LANDMARK</label>
                  <input type="text" value={newNode.landmark} onChange={(e) => setNewNode({ ...newNode, landmark: e.target.value })} className="st-cls-30e033af" />
                </div>
                <div>
                  <label  className="ext-cls-0c40bbfd">CITY *</label>
                  <input type="text" value={newNode.city} onChange={(e) => setNewNode({ ...newNode, city: e.target.value })} required className="st-cls-30e033af" />
                </div>
              </div>
              <div  className="ext-cls-8209b8e1">
                <div>
                  <label  className="ext-cls-0c40bbfd">STATE</label>
                  <input type="text" value={newNode.state} onChange={(e) => setNewNode({ ...newNode, state: e.target.value })} className="st-cls-30e033af" />
                </div>
                <div>
                  <label  className="ext-cls-0c40bbfd">COUNTRY</label>
                  <input type="text" value={newNode.country} onChange={(e) => setNewNode({ ...newNode, country: e.target.value })} className="st-cls-30e033af" />
                </div>
                <div>
                  <label  className="ext-cls-0c40bbfd">PINCODE</label>
                  <input type="text" value={newNode.pincode} onChange={(e) => setNewNode({ ...newNode, pincode: e.target.value })} className="st-cls-30e033af" />
                </div>
              </div>
              <div  className="ext-cls-5842419a">
                <div>
                  <label  className="ext-cls-0c40bbfd">LATITUDE</label>
                  <input type="number" step="any" placeholder="26.9124" value={newNode.latitude} onChange={(e) => setNewNode({ ...newNode, latitude: e.target.value })} className="st-cls-30e033af" />
                </div>
                <div>
                  <label  className="ext-cls-0c40bbfd">LONGITUDE</label>
                  <input type="number" step="any" placeholder="75.7873" value={newNode.longitude} onChange={(e) => setNewNode({ ...newNode, longitude: e.target.value })} className="st-cls-30e033af" />
                </div>
              </div>
            </div>
          )}

          {nodeActiveTab === 'contact' && (
            <div className="animate-fade-in ext-cls-21558a0c" >
              <div  className="ext-cls-5842419a">
                <div>
                  <label  className="ext-cls-0c40bbfd">PHONE NUMBER *</label>
                  <input type="tel" value={newNode.phone} onChange={(e) => setNewNode({ ...newNode, phone: e.target.value })} required className="st-cls-30e033af" />
                </div>
                <div>
                  <label  className="ext-cls-0c40bbfd">WHATSAPP NUMBER</label>
                  <input type="tel" value={newNode.whatsapp_number} onChange={(e) => setNewNode({ ...newNode, whatsapp_number: e.target.value })} className="st-cls-30e033af" />
                </div>
              </div>
              <div>
                <label  className="ext-cls-0c40bbfd">MANAGER NAME</label>
                <input type="text" value={newNode.manager_name} onChange={(e) => setNewNode({ ...newNode, manager_name: e.target.value })} className="st-cls-30e033af" />
              </div>
              <div>
                <label  className="ext-cls-0c40bbfd">BRANCH EMAIL</label>
                <input type="email" value={newNode.email} onChange={(e) => setNewNode({ ...newNode, email: e.target.value })} className="st-cls-30e033af" />
              </div>
            </div>
          )}

          {nodeActiveTab === 'timings' && (
            <div className="animate-fade-in ext-cls-73683d33" >
              <div  className="ext-cls-346c73c7">
                <span  className="ext-cls-d71cfe4a">24x7 Operational</span>
                <input type="checkbox" checked={newNode.is_24x7} onChange={(e) => setNewNode({ ...newNode, is_24x7: e.target.checked })} />
              </div>
              {!newNode.is_24x7 && Object.keys(newNode.working_hours || {}).map(day => (
                <div key={day}  className="ext-cls-bd700678">
                  <span  className="ext-cls-00c42af3">{day}</span>
                  <input type="time" value={newNode.working_hours[day].open} onChange={(e) => {
                    const wh = { ...newNode.working_hours };
                    wh[day].open = e.target.value;
                    setNewNode({ ...newNode, working_hours: wh });
                  }} className="st-cls-cd700b76" />
                  <input type="time" value={newNode.working_hours[day].close} onChange={(e) => {
                    const wh = { ...newNode.working_hours };
                    wh[day].close = e.target.value;
                    setNewNode({ ...newNode, working_hours: wh });
                  }} className="st-cls-cd700b76" />
                </div>
              ))}
            </div>
          )}

          {nodeActiveTab === 'delivery' && (
            <div className="animate-fade-in ext-cls-21558a0c" >
              <div  className="ext-cls-5842419a">
                <div>
                  <label  className="ext-cls-0c40bbfd">DELIVERY RADIUS (KM)</label>
                  <input type="number" value={newNode.delivery_radius} onChange={(e) => setNewNode({ ...newNode, delivery_radius: e.target.value })} className="st-cls-30e033af" />
                </div>
                <div>
                  <label  className="ext-cls-0c40bbfd">MIN ORDER (₹)</label>
                  <input type="number" value={newNode.min_order_amount} onChange={(e) => setNewNode({ ...newNode, min_order_amount: e.target.value })} className="st-cls-30e033af" />
                </div>
              </div>
              <div  className="ext-cls-5842419a">
                <div>
                  <label  className="ext-cls-0c40bbfd">DELIVERY CHARGES (₹)</label>
                  <input type="number" value={newNode.delivery_charges} onChange={(e) => setNewNode({ ...newNode, delivery_charges: e.target.value })} className="st-cls-30e033af" />
                </div>
                <div>
                  <label  className="ext-cls-0c40bbfd">FREE DELIVERY ABOVE (₹)</label>
                  <input type="number" value={newNode.free_delivery_above} onChange={(e) => setNewNode({ ...newNode, free_delivery_above: e.target.value })} className="st-cls-30e033af" />
                </div>
              </div>
            </div>
          )}

          {nodeActiveTab === 'billing' && (
            <div className="animate-fade-in ext-cls-21558a0c" >
              <div>
                <label  className="ext-cls-0c40bbfd">GST NUMBER</label>
                <input type="text" placeholder="22AAAAA0000A1Z5" value={newNode.gst_number} onChange={(e) => setNewNode({ ...newNode, gst_number: e.target.value })} className="st-cls-30e033af" />
              </div>
              <div  className="ext-cls-8209b8e1">
                <div>
                  <label  className="ext-cls-0c40bbfd">CGST (%)</label>
                  <input type="number" value={newNode.cgst} onChange={(e) => setNewNode({ ...newNode, cgst: e.target.value })} className="st-cls-30e033af" />
                </div>
                <div>
                  <label  className="ext-cls-0c40bbfd">SGST (%)</label>
                  <input type="number" value={newNode.sgst} onChange={(e) => setNewNode({ ...newNode, sgst: e.target.value })} className="st-cls-30e033af" />
                </div>
                <div>
                  <label  className="ext-cls-0c40bbfd">ROUND OFF BILL</label>
                  <div  className="ext-cls-1f7d599a">
                    <input type="checkbox" checked={newNode.is_round_off} onChange={(e) => setNewNode({ ...newNode, is_round_off: e.target.checked })} className="st-cls-1f94a76f" />
                    <span  className="ext-cls-57e70c32">Enabled</span>
                  </div>
                </div>
              </div>
              <div  className="ext-cls-5842419a">
                <div>
                  <label  className="ext-cls-0c40bbfd">INVOICE PREFIX</label>
                  <input type="text" value={newNode.invoice_prefix} onChange={(e) => setNewNode({ ...newNode, invoice_prefix: e.target.value })} className="st-cls-30e033af" />
                </div>
                <div>
                  <label  className="ext-cls-0c40bbfd">BILL FOOTER NOTE</label>
                  <input type="text" value={newNode.bill_footer} onChange={(e) => setNewNode({ ...newNode, bill_footer: e.target.value })} className="st-cls-30e033af" />
                </div>
              </div>
            </div>
          )}

          {nodeActiveTab === 'ai' && (
            <div className="animate-fade-in ext-cls-21558a0c" >
              <div>
                <label  className="ext-cls-0c40bbfd">AI GREETING MESSAGE</label>
                <textarea value={newNode.ai_greeting} onChange={(e) => setNewNode({ ...newNode, ai_greeting: e.target.value })} className="st-cls-ec82538c" />
              </div>
              <div  className="ext-cls-5842419a">
                <div>
                  <label  className="ext-cls-0c40bbfd">LANGUAGE</label>
                  <select value={newNode.ai_language} onChange={(e) => setNewNode({ ...newNode, ai_language: e.target.value })} className="st-cls-30e033af">
                    <option value="English">English Only</option>
                    <option value="Hindi">Hindi Only</option>
                    <option value="Hinglish">Hinglish (Mix)</option>
                  </select>
                </div>
                <div>
                  <label  className="ext-cls-0c40bbfd">TONE</label>
                  <select value={newNode.ai_tone} onChange={(e) => setNewNode({ ...newNode, ai_tone: e.target.value })} className="st-cls-30e033af">
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                    <option value="funny">Funny / Witty</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {nodeActiveTab === 'branding' && (
            <div className="animate-fade-in ext-cls-21558a0c" >
              <div>
                <label  className="ext-cls-0c40bbfd">BRANCH LOGO URL</label>
                <input type="text" value={newNode.logo_url} onChange={(e) => setNewNode({ ...newNode, logo_url: e.target.value })} className="st-cls-30e033af" />
              </div>
              <div>
                <label  className="ext-cls-0c40bbfd">COVER IMAGE URL</label>
                <input type="text" value={newNode.cover_url} onChange={(e) => setNewNode({ ...newNode, cover_url: e.target.value })} className="st-cls-30e033af" />
              </div>
            </div>
          )}

          <div  className="ext-cls-38fa89c7">
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
