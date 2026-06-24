import apiService from '../../../services/apiService';
import toast from 'react-hot-toast';
import { Plus, ChefHat, Edit2, Trash2, Package, Search, Save } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
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
            toast.error("Failed to save combo");
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
        if (!(await window.customConfirm("Are you sure you want to delete this combo?"))) return;
        try {
            await apiService.deleteDish(id);
            refreshData();
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete combo");
        }
    };

    if (!menuItems || menuItems.length === 0) return <div className="ext-cls-f88d773e">Loading Combos...</div>;

    return (
        <div className="view-container animate-slide-up ext-cls-fe93bf26" >
            <div className="ext-cls-72e6eb14">
                <div>
                    <h1 className="ext-cls-97744935">Combos & Offers</h1>
                    <p className="ext-cls-d77dc274">Bundle items together to create special offers.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="st-cls-d8a08940"
                >
                    <Plus size={18} /> Create Combo
                </button>
            </div>

            <div className="ext-cls-728b3c05">
                {combos.map(combo => (
                    <div key={combo.id} className="ext-cls-d1e477a7">
                        {combo.image_url ? (
                            <div className="ext-cls-549ef297">
                                <img src={combo.image_url.startsWith('http') ? combo.image_url : `${API_URL}${combo.image_url}`} alt={combo.name} className="ext-cls-80fb12aa" />
                            </div>
                        ) : (
                            <div className="ext-cls-e71f46d5">
                                <ChefHat size={40} color="#666" />
                            </div>
                        )}
                        <div className="ext-cls-17925079">
                            <div className="ext-cls-32810f37">
                                <h3 className="ext-cls-15bb3d47">{combo.name}</h3>
                                <span className="ext-cls-43929545">₹{combo.price}</span>
                            </div>
                            <p className="ext-cls-27a53697">
                                Includes: {Array.isArray(combo.combo_components) ? combo.combo_components.map(c => `${c.qty}x ${c.name}`).join(', ') : 'No items'}
                            </p>

                            <div className="ext-cls-ea859b14">
                                <button onClick={() => handleOpenModal(combo)} className="st-cls-1e2a4110">
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button onClick={() => deleteCombo(combo.id)} className="st-cls-f824fd0c">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {combos.length === 0 && (
                    <div className="ext-cls-d0620f00">
                        <Package size={48} color="rgba(255,255,255,0.2)" className="ext-cls-eb1757c2" />
                        <h3 className="ext-cls-0177ccd9">No combos found</h3>
                        <p className="ext-cls-d77dc274">Create your first value meal or combo offer.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && createPortal(
                <div className="ext-cls-20f1fb8b">
                    <div className="ext-cls-30b8bdd6">
                        <div className="ext-cls-0e145179">
                            <h2 className="ext-cls-6cf58d56">{editingComboId ? 'Edit Combo' : 'Create Combo'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="st-cls-509f6b92">&times;</button>
                        </div>

                        <div className="ext-cls-73afe189">
                            <div className="ext-cls-5842419a">
                                <div>
                                    <label className="ext-cls-10495414">Combo Name *</label>
                                    <input className="glass-input st-cls-02f9cc33" type="text" value={comboForm.name} onChange={e => setComboForm({ ...comboForm, name: e.target.value })} placeholder="e.g. Chai Maska Bun Combo" />
                                </div>
                                <div>
                                    <label className="ext-cls-10495414">Combo Final Price (₹) *</label>
                                    <input className="glass-input st-cls-02f9cc33" type="number" value={comboForm.price} onChange={e => setComboForm({ ...comboForm, price: e.target.value })} placeholder="e.g. 150" />
                                </div>
                            </div>

                            <div>
                                <label className="ext-cls-10495414">Image Upload or URL (Optional)</label>
                                <div className="ext-cls-6ccca837">
                                    <label className="ext-cls-0fbbad5e"

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
                                                    setComboForm({ ...comboForm, image_url: res.data.url });
                                                } catch (err) { toast("Upload failed"); } finally { setUploading(false); }
                                            }
                                        }}
                                    >
                                        {uploading ? (
                                            <div className="animate-spin ext-cls-74b34412" ></div>
                                        ) : (
                                            <div className="ext-cls-7542232d">
                                                <span className="ext-cls-dc6c2d13">Drag & drop or Click to Browse</span>
                                                <span className="ext-cls-8eb8384d">Upload a picture for this combo</span>
                                            </div>
                                        )}
                                        <input className="ext-cls-e032a669" type="file" accept="image/*" onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                setUploading(true);
                                                try {
                                                    const res = await apiService.uploadImage(formData);
                                                    setComboForm({ ...comboForm, image_url: res.data.url });
                                                } catch (err) { toast("Upload failed"); } finally { setUploading(false); }
                                            }
                                        }} />
                                    </label>

                                    <div className="ext-cls-cc0ebbd6">
                                        <div className="ext-cls-83932eff"></div>
                                        <span className="ext-cls-0c40bbfd">OR</span>
                                        <div className="ext-cls-83932eff"></div>
                                    </div>

                                    <input className="glass-input st-cls-02f9cc33" type="text" value={comboForm.image_url} onChange={e => setComboForm({ ...comboForm, image_url: e.target.value })} placeholder="Paste external image URL here (https://...)" />

                                    {comboForm.image_url && (
                                        <div className="ext-cls-86e0e3f9">
                                            <img src={comboForm.image_url.startsWith('http') ? comboForm.image_url : `${API_URL}${comboForm.image_url}`} alt="Preview" className="ext-cls-20ee7116" />
                                            <span className="ext-cls-7802e11a">{comboForm.image_url}</span>
                                            <button type="button" onClick={() => setComboForm({ ...comboForm, image_url: '' })} className="st-cls-d7ac878f">Remove</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="ext-cls-35ffac0d">Select Items for Combo</label>

                                <div className="ext-cls-4e88c209">
                                    <Search size={16} color="var(--text-muted)" className="ext-cls-41b4c9db" />
                                    <input
                                        className="glass-input st-cls-aa92f1d0"
                                        type="text"
                                        placeholder="Search menu items..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}

                                    />
                                </div>

                                <div className="ext-cls-6c2b2170">
                                    {menuItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => {
                                        const comp = comboForm.combo_components.find(c => c.itemId === item.id);
                                        const qty = comp ? comp.qty : 0;

                                        return (
                                            <div key={item.id} className="ext-cls-86399b7e">
                                                <div className="ext-cls-04a898f1">
                                                    <h4 className="ext-cls-21cd296a">{item.name}</h4>
                                                    <span className="ext-cls-b98663d3">₹{item.price}</span>
                                                </div>
                                                <div className="ext-cls-c3428cdd">
                                                    <button onClick={() => handleComponentChange(item.id, qty - 1)} className="st-cls-5258f22d">-</button>
                                                    <span className="ext-cls-308caaaa">{qty}</span>
                                                    <button onClick={() => handleComponentChange(item.id, qty + 1)} className="st-cls-08bc0005">+</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="ext-cls-482dfb3a">
                            <button onClick={() => setIsModalOpen(false)} className="st-cls-94b45b1a">Cancel</button>
                            <button onClick={handleSaveCombo} className="ext-cls-56fe5152">
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
