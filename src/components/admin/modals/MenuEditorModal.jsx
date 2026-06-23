import { AlertCircle, ImageIcon, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../config';

export default function MenuEditorModal({
  isOpen,
  onClose,
  editingDishId,
  newDish,
  setNewDish,
  categories,
  uploading,
  setUploading,
  formError,
  handleSaveDish,
  isSaving
}) {
  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      setUploading(true);
      try {
        const res = await axios.post(`${API_URL}/api/upload`, formData);
        setNewDish({ ...newDish, image_url: res.data.url });
      } catch (err) { alert("Upload failed"); } finally { setUploading(false); }
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}>
      <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '19px', borderRadius: '28px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '900', background: 'linear-gradient(135deg, #fff 0%, var(--text-muted) 100%)', WebkitBackgroundClip: 'text', }}>{editingDishId ? '✏️ Edit Menu Item' : '➕ Add New Menu Item'}</h2>
          </div>
          <button className="text-muted hover:text-white" onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>✕</button>
        </div>

        {formError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '16px 20px', borderRadius: '16px', marginBottom: '32px', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} />
            <span>{formError}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Item Name *</label>
              <input
                type="text"
                placeholder="e.g. Premium Paneer Tikka"
                value={newDish.name}
                onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                style={{ width: '100%', height: '52px', padding: '16px', borderRadius: '14px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '15px', transition: 'border 0.2s', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Category *</label>
              <select
                value={newDish.category}
                onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                style={{ width: '100%', height: '52px', padding: '0 16px', borderRadius: '14px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '15px', cursor: 'pointer', outline: 'none' }}
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Price (₹) *</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newDish.price}
                  onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                  style={{ width: '100%', height: '52px', padding: '16px', borderRadius: '14px', background: 'var(--bg-deep)', color: 'var(--accent-primary)', fontWeight: '800', border: '1px solid var(--card-border)', fontSize: '16px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Discount Config</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={newDish.discount_type || 'none'}
                    onChange={(e) => setNewDish({ ...newDish, discount_type: e.target.value })}
                    style={{ flex: 1, height: '52px', padding: '0 12px', borderRadius: '14px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                  >
                    <option value="none">No Discount</option>
                    <option value="percent">% Percent OFF</option>
                    <option value="flat">₹ Flat OFF</option>
                  </select>
                  {newDish.discount_type !== 'none' && (
                    <input
                      type="number"
                      placeholder="Value"
                      value={newDish.discount_value || ''}
                      onChange={(e) => setNewDish({ ...newDish, discount_value: e.target.value })}
                      style={{ width: '90px', height: '52px', padding: '0 12px', borderRadius: '14px', background: 'var(--bg-deep)', color: 'var(--success)', fontWeight: '800', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div style={{ padding: '20px', background: 'var(--bg-deep)', borderRadius: '16px', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '15px' }}>Eligible for Global Coupons?</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Can cart level coupons (like Neural Promotions) be applied on top of this item?</span>
              </div>
              <label className="switch">
                <input type="checkbox" checked={newDish.allow_coupons !== false} onChange={(e) => setNewDish({ ...newDish, allow_coupons: e.target.checked })} />
                <span className="slider round"></span>
              </label>
            </div>

            <div style={{ padding: '20px', background: 'var(--bg-deep)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '15px' }}>⏳ Time Restriction (Optional)</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Set specific hours this item is available (e.g. Breakfast from 8am to 12pm). Leave empty for 24/7 availability.</span>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Start Time</label>
                  <input
                    type="time"
                    value={newDish.available_from || ''}
                    onChange={(e) => setNewDish({ ...newDish, available_from: e.target.value })}
                    style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', background: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '15px', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>End Time</label>
                  <input
                    type="time"
                    value={newDish.available_to || ''}
                    onChange={(e) => setNewDish({ ...newDish, available_to: e.target.value })}
                    style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', background: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '15px', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Food Classification</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { type: 'veg', color: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' },
                  { type: 'nonveg', color: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
                  { type: 'egg', color: 'rgba(234, 179, 8, 0.2)', text: '#eab308' }
                ].map(item => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setNewDish({ ...newDish, veg_type: item.type })}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '14px',
                      background: newDish.veg_type === item.type ? item.color : 'var(--bg-deep)',
                      color: newDish.veg_type === item.type ? item.text : 'var(--text-main)',
                      border: newDish.veg_type === item.type ? `2px solid ${item.text}` : '1px solid var(--card-border)',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {item.type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Upload Food Image</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label
                  style={{
                    height: '140px',
                    border: '2px dashed var(--card-border)',
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    gap: '12px',
                    background: 'var(--bg-deep)',
                    transition: 'all 0.2s',
                    color: 'var(--text-muted)'
                  }}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--card-border)'; }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('file', file);
                      setUploading(true);
                      try {
                        const res = await axios.post(`${API_URL}/api/upload`, formData);
                        setNewDish({ ...newDish, image_url: res.data.url });
                      } catch (err) { alert("Upload failed"); } finally { setUploading(false); }
                    }
                  }}
                >
                  {uploading ? (
                    <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full"></div>
                  ) : (
                    <>
                      <ImageIcon size={28} className="text-muted" />
                      <span style={{ fontWeight: '700', fontSize: '14px' }}>Drag & drop or Click to Browse</span>
                    </>
                  )}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                </label>

                {newDish.image_url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                    <img src={newDish.image_url.startsWith('http') ? newDish.image_url : `${API_URL}${newDish.image_url}`} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '600', flex: 1, wordBreak: 'break-all' }}>{newDish.image_url}</span>
                    <button type="button" onClick={() => setNewDish({ ...newDish, image_url: '' })} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontWeight: '700', cursor: 'pointer' }}>Remove</button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Description</label>
              <textarea
                placeholder="Briefly describe dish ingredients and taste..."
                value={newDish.description}
                onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                style={{ width: '100%', minHeight: '94px', padding: '16px', borderRadius: '14px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', resize: 'none', outline: 'none' }}
              />
            </div>
            <div style={{ padding: '20px', background: 'var(--bg-deep)', borderRadius: '16px', border: '1px solid var(--card-border)', display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🔥</span>
                  <strong style={{ color: 'var(--text-main)', fontSize: '14px' }}>Best Seller</strong>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={newDish.is_best_seller || false} onChange={(e) => setNewDish({ ...newDish, is_best_seller: e.target.checked })} />
                  <span className="slider round"></span>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>✨</span>
                  <strong style={{ color: 'var(--text-main)', fontSize: '14px' }}>Today's Special</strong>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={newDish.is_today_special || false} onChange={(e) => setNewDish({ ...newDish, is_today_special: e.target.checked })} />
                  <span className="slider round"></span>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>👨‍🍳</span>
                  <strong style={{ color: 'var(--text-main)', fontSize: '14px' }}>Chef's Special</strong>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={newDish.is_chef_special || false} onChange={(e) => setNewDish({ ...newDish, is_chef_special: e.target.checked })} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
            {/* Toggle Switches */}
            <div style={{ display: 'flex', gap: '32px', marginTop: '24px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}>
                <div style={{ position: 'relative', width: '50px', height: '26px', background: newDish.is_active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', borderRadius: '20px', transition: 'all 0.3s' }}>
                  <div style={{ position: 'absolute', top: '3px', left: newDish.is_active ? '27px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'all 0.3s' }}></div>
                </div>
                <input type="checkbox" checked={newDish.is_active} onChange={(e) => setNewDish({ ...newDish, is_active: e.target.checked })} style={{ display: 'none' }} />
                <span style={{ fontSize: '14px', fontWeight: '700' }}>Available for Orders</span>
              </label>
            </div>
          </div>
        </div>

        {/* Sizes & Variants */}
        <div style={{ marginTop: '32px', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>Size Variants & Dynamic Pricing</label>
            <button
              type="button"
              onClick={() => setNewDish({ ...newDish, options: [...(newDish.options || []), { size: '', price: '' }] })}
              style={{ padding: '6px 12px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-primary)', borderRadius: '10px', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(124, 58, 237, 0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Add Variant Size
            </button>
          </div>

          {(!newDish.options || newDish.options.length === 0) ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No variants active. Standard item price will be used.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {newDish.options.map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="e.g. 30ml, Glass, Half"
                    value={opt.size}
                    onChange={(e) => {
                      const newOpts = [...newDish.options];
                      newOpts[idx].size = e.target.value;
                      setNewDish({ ...newDish, options: newOpts });
                    }}
                    style={{ flex: 1, height: '44px', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={opt.price}
                    onChange={(e) => {
                      const newOpts = [...newDish.options];
                      newOpts[idx].price = e.target.value;
                      setNewDish({ ...newDish, options: newOpts });
                    }}
                    style={{ flex: 1, height: '44px', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--accent-primary)', fontWeight: '800', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newOpts = [...newDish.options];
                      newOpts.splice(idx, 1);
                      setNewDish({ ...newDish, options: newOpts });
                    }}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add-ons & Mixers */}
        <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>Modifiers, Mixers & Add-ons</label>
            <button
              type="button"
              onClick={() => setNewDish({ ...newDish, addons: [...(newDish.addons || []), { name: '', price: '' }] })}
              style={{ padding: '6px 12px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-primary)', borderRadius: '10px', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(124, 58, 237, 0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Add Modifier
            </button>
          </div>

          {(!newDish.addons || newDish.addons.length === 0) ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No add-ons active for this item.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {newDish.addons.map((addon, idx) => (
                <div key={'addon-' + idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="e.g. Soda, Extra Cheese, Peanuts"
                    value={addon.name}
                    onChange={(e) => {
                      const newAddons = [...newDish.addons];
                      newAddons[idx].name = e.target.value;
                      setNewDish({ ...newDish, addons: newAddons });
                    }}
                    style={{ flex: 1, height: '44px', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                  />
                  <input
                    type="number"
                    placeholder="Price (+₹)"
                    value={addon.price}
                    onChange={(e) => {
                      const newAddons = [...newDish.addons];
                      newAddons[idx].price = e.target.value;
                      setNewDish({ ...newDish, addons: newAddons });
                    }}
                    style={{ flex: 1, height: '44px', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--accent-primary)', fontWeight: '800', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newAddons = [...newDish.addons];
                      newAddons.splice(idx, 1);
                      setNewDish({ ...newDish, addons: newAddons });
                    }}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky/Fixed Footer Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '40px', borderTop: '1px solid var(--card-border)', paddingTop: '24px' }}>
          <button
            type="button"
            className="btn-global-outline"
            onClick={onClose}
            
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--card-border)'}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-global-primary"
            onClick={handleSaveDish}
            disabled={uploading || isSaving}
            
            onMouseOver={(e) => !(uploading || isSaving) && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {(uploading || isSaving) ? <div className="spinner-small" /> : 'Save Menu Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
