import { Plus, ChefHat, Edit2, Trash2, Package, Search, Save } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { API_URL } from '../../../config';

const CombosManagerView = ({ adminUser, restaurantId, menuItems = [], refreshData }) => {
    const combos = menuItems.filter(i => i.is_combo === true);
    const regularItems = menuItems.filter(i => i.is_combo !== true);
    const [uploading, setUploading] = useState(false);

    // Modal state for Add/Edit Combo
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingComboId, setEditingComboId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [comboForm, setComboForm] = useState({
        name: '',
        price: '',
        description: '',
        image_url: '',
        is_active: true,
        combo_components: [] // array of { itemId: 'm123', name: 'Chai', qty: 1 }
    });

    const handleOpenModal = (combo = null) => {
        if (combo) {
            setEditingComboId(combo.id);
            setComboForm({
                name: combo.name || '',
                price: combo.price || '',
                description: combo.description || '',
                image_url: combo.image_url || '',
                is_active: combo.is_active !== false,
                combo_components: Array.isArray(combo.combo_components) ? combo.combo_components : []
            });
        } else {
            setEditingComboId(null);
            setComboForm({
                name: '', price: '', description: '', image_url: '', is_active: true, combo_components: []
            });
        }
        setSearchTerm('');
        setIsModalOpen(true);
    };

    const handleSaveCombo = async () => {
        try {
            const endpoint = editingComboId 
                ? `${API_URL}/api/menu/${editingComboId}` 
                : `${API_URL}/api/menu`;
            const method = editingComboId ? 'put' : 'post';

            const payload = {
                ...comboForm,
                restaurant_id: restaurantId || 4,
                category: 'Combos & Offers', // Put them in a fixed category
                is_combo: true
            };

            await axios[method](endpoint, payload);
            setIsModalOpen(false);
            refreshData();
        } catch (e) {
            console.error(e);
            alert("Failed to save combo");
        }
    };

    const handleComponentChange = (itemId, qty) => {
        const item = menuItems.find(m => m.id === itemId);
        if (!item) return;

        let newComps = [...comboForm.combo_components];
        const existIdx = newComps.findIndex(c => c.itemId === itemId);

        if (qty > 0) {
            if (existIdx >= 0) newComps[existIdx].qty = qty;
            else newComps.push({ itemId, name: item.name, price: item.price, qty });
        } else {
            if (existIdx >= 0) newComps.splice(existIdx, 1);
        }

        setComboForm({ ...comboForm, combo_components: newComps });
    };

    const deleteCombo = async (id) => {
        if (!window.confirm("Are you sure you want to delete this combo?")) return;
        try {
            await axios.delete(`${API_URL}/api/menu/${id}`);
            refreshData();
        } catch (e) {
            console.error(e);
            alert("Failed to delete combo");
        }
    };

    if (!menuItems || menuItems.length === 0) return <div style={{ color: 'white', padding: '40px' }}>Loading Combos...</div>;

    return (
        <div className="view-container animate-slide-up" style={{ padding: '24px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Combos & Offers</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Bundle items together to create special offers.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()} 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-primary)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                >
                    <Plus size={18} /> Create Combo
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {combos.map(combo => (
                    <div key={combo.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', overflow: 'hidden' }}>
                        {combo.image_url ? (
                            <div style={{ height: '140px', background: '#333' }}>
                                <img src={combo.image_url.startsWith('http') ? combo.image_url : `${API_URL}${combo.image_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={combo.name} />
                            </div>
                        ) : (
                            <div style={{ height: '140px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ChefHat size={40} color="#666" />
                            </div>
                        )}
                        <div style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{combo.name}</h3>
                                <span style={{ background: 'rgba(33, 150, 83, 0.2)', color: '#219653', padding: '4px 8px', borderRadius: '8px', fontWeight: '800', fontSize: '14px' }}>₹{combo.price}</span>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                Includes: {Array.isArray(combo.combo_components) ? combo.combo_components.map(c => `${c.qty}x ${c.name}`).join(', ') : 'No items'}
                            </p>
                            
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => handleOpenModal(combo)} style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button onClick={() => deleteCombo(combo.id)} style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {combos.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <Package size={48} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 16px auto' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>No combos found</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Create your first value meal or combo offer.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && createPortal(
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999 }}>
                    <div style={{ width: '600px', maxWidth: '90%', maxHeight: '90vh', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{editingComboId ? 'Edit Combo' : 'Create Combo'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                        </div>
                        
                        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)' }}>Combo Name *</label>
                                    <input className="glass-input" type="text" value={comboForm.name} onChange={e => setComboForm({...comboForm, name: e.target.value})} style={{ width: '100%', padding: '12px', outline: 'none' }} placeholder="e.g. Chai Maska Bun Combo" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)' }}>Combo Final Price (₹) *</label>
                                    <input className="glass-input" type="number" value={comboForm.price} onChange={e => setComboForm({...comboForm, price: e.target.value})} style={{ width: '100%', padding: '12px', outline: 'none' }} placeholder="e.g. 150" />
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)' }}>Image Upload or URL (Optional)</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label 
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: '1px dashed var(--card-border)', transition: 'all 0.2s', color: 'var(--text-muted)'
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
                                                    setComboForm({ ...comboForm, image_url: res.data.url });
                                                } catch (err) { alert("Upload failed"); } finally { setUploading(false); }
                                            }
                                        }}
                                    >
                                        {uploading ? (
                                            <div className="animate-spin" style={{ width: '24px', height: '24px', border: '2px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ fontWeight: '700', fontSize: '14px', color: 'white' }}>Drag & drop or Click to Browse</span>
                                                <span style={{ fontSize: '12px' }}>Upload a picture for this combo</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                setUploading(true);
                                                try {
                                                    const res = await axios.post(`${API_URL}/api/upload`, formData);
                                                    setComboForm({ ...comboForm, image_url: res.data.url });
                                                } catch (err) { alert("Upload failed"); } finally { setUploading(false); }
                                            }
                                        }} />
                                    </label>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ flex: 1, height: '1px', background: 'var(--card-border)' }}></div>
                                        <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>OR</span>
                                        <div style={{ flex: 1, height: '1px', background: 'var(--card-border)' }}></div>
                                    </div>

                                    <input className="glass-input" type="text" value={comboForm.image_url} onChange={e => setComboForm({...comboForm, image_url: e.target.value})} style={{ width: '100%', padding: '12px', outline: 'none' }} placeholder="Paste external image URL here (https://...)" />

                                    {comboForm.image_url && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', border: '1px solid var(--card-border)', marginTop: '4px' }}>
                                            <img src={comboForm.image_url.startsWith('http') ? comboForm.image_url : `${API_URL}${comboForm.image_url}`} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                                            <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '600', flex: 1, wordBreak: 'break-all' }}>{comboForm.image_url}</span>
                                            <button type="button" onClick={() => setComboForm({ ...comboForm, image_url: '' })} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer' }}>Remove</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '15px', fontWeight: '900', color: 'white' }}>Select Items for Combo</label>
                                
                                <div style={{ position: 'relative', marginBottom: '12px' }}>
                                    <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input 
                                        className="glass-input"
                                        type="text" 
                                        placeholder="Search menu items..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ width: '100%', padding: '12px 12px 12px 36px', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ background: 'var(--badge-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '16px', maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {menuItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => {
                                        const comp = comboForm.combo_components.find(c => c.itemId === item.id);
                                        const qty = comp ? comp.qty : 0;
                                        
                                        return (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{item.name}</h4>
                                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>₹{item.price}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
                                                    <button onClick={() => handleComponentChange(item.id, qty - 1)} style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer' }}>-</button>
                                                    <span style={{ width: '20px', textAlign: 'center', fontWeight: '800' }}>{qty}</span>
                                                    <button onClick={() => handleComponentChange(item.id, qty + 1)} style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--accent-primary)', color: 'white', border: 'none', cursor: 'pointer' }}>+</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '12px 24px', borderRadius: '12px', background: 'transparent', color: 'white', border: '1px solid var(--card-border)', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                            <button onClick={handleSaveCombo} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: 'var(--accent-primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                                <Save size={16} /> Save Combo
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CombosManagerView;
