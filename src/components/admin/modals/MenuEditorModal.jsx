import apiService from '../../../services/apiService';
import toast from 'react-hot-toast';
import { AlertCircle, ImageIcon, Plus, Trash2 } from 'lucide-react';
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
        const res = await apiService.uploadImage(formData);
        setNewDish({ ...newDish, image_url: res.data.url });
      } catch (err) { toast("Upload failed"); } finally { setUploading(false); }
    }
  };

  return (
    <div className="modal-overlay ext-cls-16fc3b80" >
      <div className="modal-content glass-panel animate-slide-up ext-cls-901841ea" >
        <div  className="ext-cls-938c716e">
          <div>
            <h2  className="ext-cls-3e0eaff8">{editingDishId ? '✏️ Edit Menu Item' : '➕ Add New Menu Item'}</h2>
          </div>
          <button className="text-muted hover:text-white ext-cls-0f9a2bfc" onClick={onClose} >✕</button>
        </div>

        {formError && (
          <div  className="ext-cls-7008ca5f">
            <AlertCircle size={20} />
            <span>{formError}</span>
          </div>
        )}

        <div  className="ext-cls-1c0aea72">
          {/* Left Column */}
          <div  className="ext-cls-a6e672cb">
            <div>
              <label  className="ext-cls-84143712">Item Name *</label>
              <input
                type="text"
                placeholder="e.g. Premium Paneer Tikka"
                value={newDish.name}
                onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                className="st-cls-ece01a9d"
              />
            </div>

            <div>
              <label  className="ext-cls-84143712">Category *</label>
              <select
                value={newDish.category}
                onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                className="st-cls-fdd93749"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div  className="ext-cls-5842419a">
              <div>
                <label  className="ext-cls-84143712">Price (₹) *</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newDish.price}
                  onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                  className="st-cls-27c52e2e"
                />
              </div>
              <div>
                <label  className="ext-cls-84143712">Discount Config</label>
                <div  className="ext-cls-441e8d8e">
                  <select
                    value={newDish.discount_type || 'none'}
                    onChange={(e) => setNewDish({ ...newDish, discount_type: e.target.value })}
                    className="st-cls-0a9a24c6"
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
                      className="st-cls-ae83ca42"
                    />
                  )}
                </div>
              </div>
            </div>

            <div  className="ext-cls-17c9974f">
              <div>
                <strong  className="ext-cls-6b67635c">Eligible for Global Coupons?</strong>
                <span  className="ext-cls-31e0a1fc">Can cart level coupons (like Neural Promotions) be applied on top of this item?</span>
              </div>
              <label className="switch">
                <input type="checkbox" checked={newDish.allow_coupons !== false} onChange={(e) => setNewDish({ ...newDish, allow_coupons: e.target.checked })} />
                <span className="slider round"></span>
              </label>
            </div>

            <div  className="ext-cls-b41175c0">
              <div  className="ext-cls-81709532">
                <strong  className="ext-cls-6b67635c">⏳ Time Restriction (Optional)</strong>
                <span  className="ext-cls-31e0a1fc">Set specific hours this item is available (e.g. Breakfast from 8am to 12pm). Leave empty for 24/7 availability.</span>
              </div>
              <div  className="ext-cls-78e7532f">
                <div  className="ext-cls-04a898f1">
                  <label  className="ext-cls-79960b78">Start Time</label>
                  <input
                    type="time"
                    value={newDish.available_from || ''}
                    onChange={(e) => setNewDish({ ...newDish, available_from: e.target.value })}
                    className="st-cls-624dd470"
                  />
                </div>
                <div  className="ext-cls-04a898f1">
                  <label  className="ext-cls-79960b78">End Time</label>
                  <input
                    type="time"
                    value={newDish.available_to || ''}
                    onChange={(e) => setNewDish({ ...newDish, available_to: e.target.value })}
                    className="st-cls-624dd470"
                  />
                </div>
              </div>
            </div>

            <div>
              <label  className="ext-cls-84143712">Food Classification</label>
              <div  className="ext-cls-ea859b14">
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
          <div  className="ext-cls-a6e672cb">
            <div>
              <label  className="ext-cls-84143712">Upload Food Image</label>
              <div  className="ext-cls-73683d33">
                <label className="ext-cls-277423ba" 
                  
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
                        const res = await apiService.uploadImage(formData);
                        setNewDish({ ...newDish, image_url: res.data.url });
                      } catch (err) { toast("Upload failed"); } finally { setUploading(false); }
                    }
                  }}
                >
                  {uploading ? (
                    <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full"></div>
                  ) : (
                    <>
                      <ImageIcon size={28} className="text-muted" />
                      <span  className="ext-cls-9f42a204">Drag & drop or Click to Browse</span>
                    </>
                  )}
                  <input type="file" accept="image/*"  onChange={handleFileUpload} className="ext-cls-e032a669" />
                </label>

                {newDish.image_url && (
                  <div  className="ext-cls-8b23a076">
                    <img src={newDish.image_url.startsWith('http') ? newDish.image_url : `${API_URL}${newDish.image_url}`} alt="Preview"  className="ext-cls-20ee7116" />
                    <span  className="ext-cls-7802e11a">{newDish.image_url}</span>
                    <button type="button" onClick={() => setNewDish({ ...newDish, image_url: '' })} className="st-cls-90e03de7">Remove</button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label  className="ext-cls-84143712">Description</label>
              <textarea
                placeholder="Briefly describe dish ingredients and taste..."
                value={newDish.description}
                onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                className="st-cls-fb781cb4"
              />
            </div>
            <div  className="ext-cls-b87b2ac0">
              <div  className="ext-cls-1bdb758b">
                <div  className="ext-cls-9fdd7fb0">
                  <span  className="ext-cls-c65650a6">🔥</span>
                  <strong  className="ext-cls-6e3df0b9">Best Seller</strong>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={newDish.is_best_seller || false} onChange={(e) => setNewDish({ ...newDish, is_best_seller: e.target.checked })} />
                  <span className="slider round"></span>
                </label>
              </div>
              <div  className="ext-cls-1bdb758b">
                <div  className="ext-cls-9fdd7fb0">
                  <span  className="ext-cls-c65650a6">✨</span>
                  <strong  className="ext-cls-6e3df0b9">Today's Special</strong>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={newDish.is_today_special || false} onChange={(e) => setNewDish({ ...newDish, is_today_special: e.target.checked })} />
                  <span className="slider round"></span>
                </label>
              </div>
              <div  className="ext-cls-1bdb758b">
                <div  className="ext-cls-9fdd7fb0">
                  <span  className="ext-cls-c65650a6">👨‍🍳</span>
                  <strong  className="ext-cls-6e3df0b9">Chef's Special</strong>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={newDish.is_chef_special || false} onChange={(e) => setNewDish({ ...newDish, is_chef_special: e.target.checked })} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
            {/* Toggle Switches */}
            <div  className="ext-cls-660536d5">
              <label  className="ext-cls-3a1c8363">
                <div style={{ position: 'relative', width: '50px', height: '26px', background: newDish.is_active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', borderRadius: '20px', transition: 'all 0.3s' }}>
                  <div style={{ position: 'absolute', top: '3px', left: newDish.is_active ? '27px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'all 0.3s' }}></div>
                </div>
                <input type="checkbox" checked={newDish.is_active} onChange={(e) => setNewDish({ ...newDish, is_active: e.target.checked })} className="st-cls-e032a669" />
                <span  className="ext-cls-72a3e651">Available for Orders</span>
              </label>
            </div>
          </div>
        </div>

        {/* Sizes & Variants */}
        <div  className="ext-cls-983bcdae">
          <div  className="ext-cls-37275853">
            <label  className="ext-cls-be837ac0">Size Variants & Dynamic Pricing</label>
            <button
              type="button"
              onClick={() => setNewDish({ ...newDish, options: [...(newDish.options || []), { size: '', price: '' }] })}
              className="st-cls-d705471d"
            >
              <Plus size={14} /> Add Variant Size
            </button>
          </div>

          {(!newDish.options || newDish.options.length === 0) ? (
            <p  className="ext-cls-b98663d3">No variants active. Standard item price will be used.</p>
          ) : (
            <div  className="ext-cls-6ccca837">
              {newDish.options.map((opt, idx) => (
                <div key={idx}  className="ext-cls-cc0ebbd6">
                  <input
                    type="text"
                    placeholder="e.g. 30ml, Glass, Half"
                    value={opt.size}
                    onChange={(e) => {
                      const newOpts = [...newDish.options];
                      newOpts[idx].size = e.target.value;
                      setNewDish({ ...newDish, options: newOpts });
                    }}
                    className="st-cls-7564d300"
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
                    className="st-cls-6aaec140"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newOpts = [...newDish.options];
                      newOpts.splice(idx, 1);
                      setNewDish({ ...newDish, options: newOpts });
                    }}
                    className="st-cls-f365705a"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add-ons & Mixers */}
        <div  className="ext-cls-ec5cfadb">
          <div  className="ext-cls-37275853">
            <label  className="ext-cls-be837ac0">Modifiers, Mixers & Add-ons</label>
            <button
              type="button"
              onClick={() => setNewDish({ ...newDish, addons: [...(newDish.addons || []), { name: '', price: '' }] })}
              className="st-cls-d705471d"
            >
              <Plus size={14} /> Add Modifier
            </button>
          </div>

          {(!newDish.addons || newDish.addons.length === 0) ? (
            <p  className="ext-cls-b98663d3">No add-ons active for this item.</p>
          ) : (
            <div  className="ext-cls-6ccca837">
              {newDish.addons.map((addon, idx) => (
                <div key={'addon-' + idx}  className="ext-cls-cc0ebbd6">
                  <input
                    type="text"
                    placeholder="e.g. Soda, Extra Cheese, Peanuts"
                    value={addon.name}
                    onChange={(e) => {
                      const newAddons = [...newDish.addons];
                      newAddons[idx].name = e.target.value;
                      setNewDish({ ...newDish, addons: newAddons });
                    }}
                    className="st-cls-7564d300"
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
                    className="st-cls-6aaec140"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newAddons = [...newDish.addons];
                      newAddons.splice(idx, 1);
                      setNewDish({ ...newDish, addons: newAddons });
                    }}
                    className="st-cls-f365705a"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky/Fixed Footer Controls */}
        <div  className="ext-cls-b4c49a30">
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
